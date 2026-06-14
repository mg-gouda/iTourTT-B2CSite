// One-off generator: translates the unique English route copy
// (route-content.en.json) into every supported locale via Gemini and writes
// route-content.generated.json. Run from repo root:
//   GEMINI_API_KEY=… node scripts/translate-route-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB = join(__dirname, '..', 'src', 'lib');
const TARGET_LOCALES = { ar: 'Arabic', de: 'German', fr: 'French', it: 'Italian', nl: 'Dutch', ru: 'Russian' };
const MODEL = 'gemini-2.5-flash';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY is required'); process.exit(1); }

const en = JSON.parse(readFileSync(join(LIB, 'route-content.en.json'), 'utf8'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

const langList = Object.entries(TARGET_LOCALES).map(([c, n]) => `${c} (${n})`).join(', ');

function buildPrompt(key, entry) {
  return [
    'You are a professional translator for a travel website that sells private airport transfers in Egypt.',
    `Translate the English content below into these languages: ${langList}.`,
    'Rules:',
    '- Keep a natural, fluent marketing tone — do not translate word-for-word.',
    '- Place names, resort names and landmarks (e.g. El Gouna, Karnak, Borg El Arab, Naama Bay) should be rendered the way they are normally written in each target language (transliterate into Arabic/Russian scripts naturally).',
    '- Keep "Transfera" unchanged.',
    '- Preserve the exact number of body paragraphs (2).',
    'Return ONLY valid JSON, no markdown, with exactly this shape:',
    '{"ar":{"body":["p1","p2"],"faqQ":"...","faqA":"..."},"de":{...},"fr":{...},"it":{...},"nl":{...},"ru":{...}}',
    '',
    `English source (route "${key}"):`,
    JSON.stringify({ body: entry.body, faqQ: entry.faqQ, faqA: entry.faqA }),
  ].join('\n');
}

function validate(obj) {
  for (const loc of Object.keys(TARGET_LOCALES)) {
    const v = obj?.[loc];
    if (!v || !Array.isArray(v.body) || v.body.length !== 2 || !v.faqQ || !v.faqA) {
      throw new Error(`missing/invalid locale ${loc}`);
    }
  }
}

async function translateRoute(key, entry) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await gemini(buildPrompt(key, entry));
      const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim());
      validate(parsed);
      return parsed;
    } catch (e) {
      lastErr = e;
      console.warn(`  retry ${key} (attempt ${attempt}): ${e.message}`);
      await sleep(1500 * attempt);
    }
  }
  throw new Error(`failed ${key}: ${lastErr?.message}`);
}

async function main() {
  const keys = Object.keys(en);
  const out = {}; // locale -> key -> {body,faqQ,faqA}
  for (const loc of Object.keys(TARGET_LOCALES)) out[loc] = {};

  const CONCURRENCY = 4;
  let idx = 0;
  async function worker() {
    while (idx < keys.length) {
      const i = idx++;
      const key = keys[i];
      const res = await translateRoute(key, en[key]);
      for (const loc of Object.keys(TARGET_LOCALES)) out[loc][key] = res[loc];
      console.log(`✓ ${key} (${i + 1}/${keys.length})`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Stable key ordering matching the English source.
  const ordered = {};
  for (const loc of Object.keys(TARGET_LOCALES)) {
    ordered[loc] = {};
    for (const key of keys) ordered[loc][key] = out[loc][key];
  }
  writeFileSync(join(LIB, 'route-content.generated.json'), JSON.stringify(ordered, null, 2) + '\n');
  console.log(`\nWrote route-content.generated.json (${keys.length} routes × ${Object.keys(TARGET_LOCALES).length} locales).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
