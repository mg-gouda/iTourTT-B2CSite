// Yoast-style SEO + readability + AI-readiness (GEO/AEO) analysis.
// Pure functions, no DOM — safe to unit test. English heuristics (base content).
// Grounded in current guidance: answer-first "answer capsules", fact density,
// E-E-A-T author/schema, plus classic keyphrase + readability checks.

export type Rating = 'good' | 'ok' | 'bad';
export type Group = 'seo' | 'readability' | 'ai';
export interface Check {
  id: string;
  group: Group;
  rating: Rating;
  text: string;
}

export interface SeoInput {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  contentHtml?: string;
  focusKeyphrase?: string;
  author?: string;
  schemaType?: string;
  coverImageUrl?: string;
}

// ── HTML / text extraction ──────────────────────────────────────────────
export function stripHtml(html = ''): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
function headings(html = ''): { level: number; text: string }[] {
  const out: { level: number; text: string }[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ level: +m[1], text: stripHtml(m[2]) });
  return out;
}
function firstParagraph(html = ''): string {
  const m = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  return m ? stripHtml(m[1]) : stripHtml(html).split(/(?<=[.!?])\s/).slice(0, 2).join(' ');
}
function images(html = ''): { alt: string }[] {
  const out: { alt: string }[] = [];
  const re = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const alt = /alt\s*=\s*["']([^"']*)["']/i.exec(m[0]);
    out.push({ alt: alt ? alt[1] : '' });
  }
  return out;
}
function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? []);
}
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}
function paragraphs(html = ''): string[] {
  const ps = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (ps) return ps.map((p) => stripHtml(p)).filter(Boolean);
  return stripHtml(html).split(/\n{2,}/).filter(Boolean);
}
function includesPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  return haystack.toLowerCase().includes(phrase.toLowerCase().trim());
}

// ── Flesch reading ease ─────────────────────────────────────────────────
function syllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}
export function fleschReadingEase(text: string): number {
  const ws = words(text);
  const ss = sentences(text);
  if (ws.length === 0 || ss.length === 0) return 0;
  const syl = ws.reduce((a, w) => a + syllables(w), 0);
  const score = 206.835 - 1.015 * (ws.length / ss.length) - 84.6 * (syl / ws.length);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// English heuristics
const TRANSITIONS = ['however','therefore','moreover','furthermore','consequently','meanwhile','nevertheless','nonetheless','accordingly','besides','additionally','similarly','likewise','conversely','instead','thus','hence','indeed','finally','firstly','secondly','next','then','also','because','although','though','while','whereas','since','despite','in addition','for example','for instance','in contrast','on the other hand','as a result','in conclusion','to summarize','in fact','of course','in particular','above all'];
const BE = ['is','are','was','were','be','been','being','am','get','got','gets'];
const IRREGULAR_PP = ['made','done','said','seen','taken','given','known','shown','written','found','held','built','sent','kept','told','brought','bought','paid','met','led','driven','chosen'];
function isPassive(sentence: string): boolean {
  const w = words(sentence);
  for (let i = 0; i < w.length - 1; i++) {
    if (BE.includes(w[i])) {
      for (let j = i + 1; j <= Math.min(i + 3, w.length - 1); j++) {
        if (/ed$/.test(w[j]) || IRREGULAR_PP.includes(w[j])) return true;
      }
    }
  }
  return false;
}

const pct = (n: number, d: number) => (d === 0 ? 0 : (n / d) * 100);
const check = (id: string, group: Group, rating: Rating, text: string): Check => ({ id, group, rating, text });

// ── SEO (keyphrase) analysis ────────────────────────────────────────────
export function analyzeSeo(input: SeoInput): Check[] {
  const c: Check[] = [];
  const kp = (input.focusKeyphrase ?? '').trim();
  const seoTitle = input.metaTitle || input.title || '';
  const plain = stripHtml(input.contentHtml);
  const contentWords = words(plain);
  const hs = headings(input.contentHtml);
  const imgs = images(input.contentHtml);

  if (!kp) {
    c.push(check('kp-set', 'seo', 'bad', 'No focus keyphrase set. Set one to unlock keyphrase analysis.'));
  } else {
    const kpWords = kp.split(/\s+/).length;
    c.push(kpWords <= 4
      ? check('kp-length', 'seo', 'good', `Keyphrase length: ${kpWords} word(s) — good.`)
      : check('kp-length', 'seo', 'ok', `Keyphrase is ${kpWords} words — consider a shorter phrase.`));

    c.push(includesPhrase(seoTitle, kp)
      ? check('kp-title', 'seo', 'good', 'Keyphrase appears in the SEO title.')
      : check('kp-title', 'seo', 'bad', 'Keyphrase not in the SEO title — add it, ideally near the front.'));

    c.push(includesPhrase(input.metaDescription ?? '', kp)
      ? check('kp-meta', 'seo', 'good', 'Keyphrase appears in the meta description.')
      : check('kp-meta', 'seo', 'bad', 'Keyphrase not in the meta description.'));

    c.push(includesPhrase(input.slug ?? '', kp.replace(/\s+/g, '-'))
      ? check('kp-slug', 'seo', 'good', 'Keyphrase appears in the URL slug.')
      : check('kp-slug', 'seo', 'ok', 'Keyphrase not in the slug — consider adding it.'));

    c.push(includesPhrase(firstParagraph(input.contentHtml), kp)
      ? check('kp-intro', 'seo', 'good', 'Keyphrase appears in the introduction.')
      : check('kp-intro', 'seo', 'bad', 'Keyphrase not in the first paragraph — introduce it early.'));

    const inSub = hs.some((h) => includesPhrase(h.text, kp));
    c.push(inSub
      ? check('kp-subhead', 'seo', 'good', 'Keyphrase appears in a subheading.')
      : check('kp-subhead', 'seo', 'ok', 'Keyphrase not in any subheading — add it to an H2/H3.'));

    // density
    const kpLower = kp.toLowerCase();
    let occ = 0;
    const joined = ' ' + contentWords.join(' ') + ' ';
    let idx = joined.indexOf(kpLower);
    while (idx !== -1) { occ++; idx = joined.indexOf(kpLower, idx + kpLower.length); }
    const density = pct(occ * kp.split(/\s+/).length, contentWords.length);
    c.push(
      density === 0 ? check('kp-density', 'seo', 'bad', 'Keyphrase does not appear in the content.')
      : density < 0.5 ? check('kp-density', 'seo', 'ok', `Keyphrase density ${density.toFixed(1)}% — a little low.`)
      : density <= 3 ? check('kp-density', 'seo', 'good', `Keyphrase density ${density.toFixed(1)}% — good.`)
      : check('kp-density', 'seo', 'ok', `Keyphrase density ${density.toFixed(1)}% — may be over-optimized.`));

    const inAlt = imgs.some((i) => includesPhrase(i.alt, kp));
    if (imgs.length > 0) {
      c.push(inAlt
        ? check('kp-imgalt', 'seo', 'good', 'An image alt text contains the keyphrase.')
        : check('kp-imgalt', 'seo', 'ok', 'No image alt text contains the keyphrase.'));
    }
  }

  // length / meta checks (independent of keyphrase)
  c.push(contentWords.length >= 300
    ? check('length', 'seo', 'good', `Content length: ${contentWords.length} words — good.`)
    : check('length', 'seo', contentWords.length >= 150 ? 'ok' : 'bad', `Content length: ${contentWords.length} words — aim for 300+.`));

  const md = (input.metaDescription ?? '').length;
  c.push(md === 0 ? check('meta-len', 'seo', 'bad', 'No meta description — write one.')
    : md < 120 ? check('meta-len', 'seo', 'ok', `Meta description is short (${md} chars) — aim ~120–155.`)
    : md <= 160 ? check('meta-len', 'seo', 'good', `Meta description length good (${md} chars).`)
    : check('meta-len', 'seo', 'ok', `Meta description may be truncated (${md} chars).`));

  const tl = seoTitle.length;
  c.push(tl === 0 ? check('title-len', 'seo', 'bad', 'No SEO title.')
    : tl <= 60 ? check('title-len', 'seo', 'good', `SEO title length good (${tl} chars).`)
    : check('title-len', 'seo', 'ok', `SEO title may be truncated (${tl} chars).`));

  const missingAlt = imgs.filter((i) => !i.alt.trim()).length;
  if (imgs.length) {
    c.push(missingAlt === 0
      ? check('img-alt', 'seo', 'good', 'All images have alt text.')
      : check('img-alt', 'seo', 'ok', `${missingAlt} image(s) missing alt text.`));
  }
  return c;
}

// ── Readability analysis ────────────────────────────────────────────────
export function analyzeReadability(input: SeoInput): Check[] {
  const c: Check[] = [];
  const plain = stripHtml(input.contentHtml);
  const ss = sentences(plain);
  const ps = paragraphs(input.contentHtml);
  const hs = headings(input.contentHtml);

  const flesch = fleschReadingEase(plain);
  c.push(
    flesch >= 60 ? check('flesch', 'readability', 'good', `Flesch reading ease ${flesch} — easy to read.`)
    : flesch >= 50 ? check('flesch', 'readability', 'ok', `Flesch reading ease ${flesch} — fairly hard; simplify.`)
    : check('flesch', 'readability', 'bad', `Flesch reading ease ${flesch} — hard to read; shorten sentences/words.`));

  if (ss.length) {
    const longSent = ss.filter((s) => words(s).length > 20).length;
    const p = pct(longSent, ss.length);
    c.push(p <= 25
      ? check('sent-len', 'readability', 'good', `${p.toFixed(0)}% of sentences are long — good.`)
      : check('sent-len', 'readability', 'ok', `${p.toFixed(0)}% of sentences over 20 words — shorten some.`));

    const passive = ss.filter(isPassive).length;
    const pp = pct(passive, ss.length);
    c.push(pp <= 10
      ? check('passive', 'readability', 'good', `${pp.toFixed(0)}% passive voice — good.`)
      : check('passive', 'readability', 'ok', `${pp.toFixed(0)}% passive voice — prefer active voice.`));

    const trans = ss.filter((s) => TRANSITIONS.some((t) => s.toLowerCase().includes(t))).length;
    const tp = pct(trans, ss.length);
    c.push(tp >= 30
      ? check('transition', 'readability', 'good', `${tp.toFixed(0)}% of sentences use transition words — good.`)
      : check('transition', 'readability', 'ok', `Only ${tp.toFixed(0)}% use transition words — add connectors (however, therefore…).`));

    // consecutive sentence starts
    let consecutive = false;
    for (let i = 2; i < ss.length; i++) {
      const a = words(ss[i])[0], b = words(ss[i - 1])[0], d = words(ss[i - 2])[0];
      if (a && a === b && b === d) { consecutive = true; break; }
    }
    c.push(consecutive
      ? check('sent-start', 'readability', 'ok', 'Three+ consecutive sentences start with the same word — vary them.')
      : check('sent-start', 'readability', 'good', 'Sentence beginnings are varied.'));
  }

  const longPara = ps.filter((p) => words(p).length > 150).length;
  c.push(longPara === 0
    ? check('para-len', 'readability', 'good', 'No overly long paragraphs.')
    : check('para-len', 'readability', 'ok', `${longPara} paragraph(s) over 150 words — split them.`));

  const wordsTotal = words(plain).length;
  if (wordsTotal > 300 && hs.length === 0) {
    c.push(check('subheads', 'readability', 'bad', 'No subheadings — add H2/H3 to break up the text.'));
  } else if (wordsTotal > 300) {
    c.push(check('subheads', 'readability', 'good', 'Content uses subheadings.'));
  }
  return c;
}

// ── AI readiness (GEO / AEO) ────────────────────────────────────────────
export function analyzeAi(input: SeoInput): Check[] {
  const c: Check[] = [];
  const intro = firstParagraph(input.contentHtml);
  const introWords = words(intro).length;
  const plain = stripHtml(input.contentHtml);
  const hs = headings(input.contentHtml);

  // Answer capsule: a direct 40–80 word answer up top wins AI citations.
  c.push(
    introWords === 0 ? check('answer-capsule', 'ai', 'bad', 'No intro — lead with a direct 40–80 word answer.')
    : introWords >= 40 && introWords <= 80 ? check('answer-capsule', 'ai', 'good', `Intro is ${introWords} words — a strong answer capsule for AI engines.`)
    : introWords < 40 ? check('answer-capsule', 'ai', 'ok', `Intro is ${introWords} words — expand to a 40–80 word direct answer.`)
    : check('answer-capsule', 'ai', 'ok', `Intro is ${introWords} words — tighten to a 40–80 word answer capsule.`));

  // Fact density: numbers/dates/percentages per 100 words.
  const nums = (plain.match(/\b\d[\d,.]*\s?(%|km|min|hours?|EGP|USD|EUR|AED|\$|€)?\b/gi) ?? []).length;
  const per100 = words(plain).length ? (nums / words(plain).length) * 100 : 0;
  c.push(per100 >= 1.5
    ? check('fact-density', 'ai', 'good', `Fact density ${per100.toFixed(1)}/100 words — concrete data helps AI cite you.`)
    : check('fact-density', 'ai', 'ok', `Fact density ${per100.toFixed(1)}/100 words — add specific numbers, prices, durations.`));

  // Question-style headings (match "People Also Ask" / AEO intent).
  const qHeads = hs.filter((h) => /\?$/.test(h.text.trim()) || /^(how|what|why|when|where|which|can|is|are|do|does)\b/i.test(h.text.trim())).length;
  c.push(qHeads > 0
    ? check('q-headings', 'ai', 'good', `${qHeads} question-style heading(s) — good for answer engines.`)
    : check('q-headings', 'ai', 'ok', 'No question-style headings — add “How…/What…?” subheadings.'));

  // E-E-A-T: named author.
  c.push(input.author?.trim()
    ? check('author', 'ai', 'good', 'Named author set — strengthens E-E-A-T / AI trust.')
    : check('author', 'ai', 'ok', 'No author — add a named author for E-E-A-T.'));

  // Structured data present.
  c.push(input.schemaType && input.schemaType !== 'none'
    ? check('schema', 'ai', 'good', `Structured data: ${input.schemaType} — helps AI Overviews & Knowledge Graph.`)
    : check('schema', 'ai', 'ok', 'No schema type selected — pick Article/BlogPosting in Advanced.'));

  return c;
}

export interface AnalysisResult {
  seo: Check[];
  readability: Check[];
  ai: Check[];
  score: Record<Group, { good: number; ok: number; bad: number; rating: Rating }>;
}
function summarize(checks: Check[]): { good: number; ok: number; bad: number; rating: Rating } {
  const good = checks.filter((x) => x.rating === 'good').length;
  const ok = checks.filter((x) => x.rating === 'ok').length;
  const bad = checks.filter((x) => x.rating === 'bad').length;
  const rating: Rating = bad > 0 ? 'bad' : ok > good ? 'ok' : 'good';
  return { good, ok, bad, rating };
}
export function analyze(input: SeoInput): AnalysisResult {
  const seo = analyzeSeo(input);
  const readability = analyzeReadability(input);
  const ai = analyzeAi(input);
  return {
    seo, readability, ai,
    score: { seo: summarize(seo), readability: summarize(readability), ai: summarize(ai) },
  };
}
