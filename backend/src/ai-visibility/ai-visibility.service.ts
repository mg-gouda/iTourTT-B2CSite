import { Injectable } from '@nestjs/common';

// One brand we track visibility for. Kept here (not per-request) — the whole
// point of this tool is "is *our* site cited". Override later if multi-brand.
export interface Brand {
  name: string;
  domain: string;
}

export interface EngineResult {
  engine: string;
  configured: boolean;
  cited: boolean;
  mention: string | null;
  sources: string[];
  error?: string;
}

const TIMEOUT_MS = 20_000;

@Injectable()
export class AiVisibilityService {
  private readonly brand: Brand = { name: 'Transferra', domain: 'transferra.ae' };

  // Which engines have their API key set. Drives the "not configured" UI hints.
  getStatus() {
    return {
      brand: this.brand,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.SERPAPI_KEY,
    };
  }

  async check(query: string, engines?: string[]): Promise<EngineResult[]> {
    const adapters: Record<string, () => Promise<EngineResult>> = {
      perplexity: () => this.checkPerplexity(query, this.brand),
      openai: () => this.checkOpenAI(query, this.brand),
      google: () => this.checkGoogle(query, this.brand),
    };
    const selected = (engines?.length ? engines : Object.keys(adapters)).filter(
      (e) => e in adapters,
    );
    return Promise.all(selected.map((e) => adapters[e]()));
  }

  // ── Perplexity (Sonar) ──────────────────────────────────────────────
  private async checkPerplexity(query: string, brand: Brand): Promise<EngineResult> {
    const engine = 'perplexity';
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return this.notConfigured(engine);
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.PERPLEXITY_MODEL ?? 'sonar',
          messages: [
            { role: 'system', content: 'Be precise. Cite your sources.' },
            { role: 'user', content: query },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        return this.errored(engine, data?.error?.message ?? `HTTP ${res.status}`);
      }
      const answer: string = data?.choices?.[0]?.message?.content ?? '';
      const fromCitations: string[] = Array.isArray(data?.citations) ? data.citations : [];
      const fromResults: string[] = (Array.isArray(data?.search_results) ? data.search_results : [])
        .map((s: any) => s?.url)
        .filter(Boolean);
      const sources = this.dedupe([...fromCitations, ...fromResults]);
      const cited = this.textHasBrand(answer, brand) || this.sourcesHaveBrand(sources, brand);
      return { engine, configured: true, cited, mention: this.snippet(answer, brand), sources };
    } catch (e: any) {
      return this.errored(engine, e?.message ?? 'request failed');
    }
  }

  // ── OpenAI (Responses API + web search) ─────────────────────────────
  private async checkOpenAI(query: string, brand: Brand): Promise<EngineResult> {
    const engine = 'openai';
    const key = process.env.OPENAI_API_KEY;
    if (!key) return this.notConfigured(engine);
    try {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: query,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        return this.errored(engine, data?.error?.message ?? `HTTP ${res.status}`);
      }
      // Walk the Responses `output` array: collect text + url citations.
      let text = '';
      const sourceSet = new Set<string>();
      for (const item of Array.isArray(data?.output) ? data.output : []) {
        for (const c of Array.isArray(item?.content) ? item.content : []) {
          if (typeof c?.text === 'string') text += (text ? '\n' : '') + c.text;
          for (const ann of Array.isArray(c?.annotations) ? c.annotations : []) {
            if (typeof ann?.url === 'string') sourceSet.add(ann.url);
          }
        }
      }
      if (!text && typeof data?.output_text === 'string') text = data.output_text;
      const sources = [...sourceSet];
      const cited = this.textHasBrand(text, brand) || this.sourcesHaveBrand(sources, brand);
      return { engine, configured: true, cited, mention: this.snippet(text, brand), sources };
    } catch (e: any) {
      return this.errored(engine, e?.message ?? 'request failed');
    }
  }

  // ── Google AI Overviews (via SerpApi) ───────────────────────────────
  private async checkGoogle(query: string, brand: Brand): Promise<EngineResult> {
    const engine = 'google';
    const key = process.env.SERPAPI_KEY;
    if (!key) return this.notConfigured(engine);
    try {
      let overview = await this.serpApiOverview(query, key);
      // SerpApi sometimes returns only a page_token — fetch the block itself.
      if (overview?.page_token && !overview?.text_blocks) {
        overview = (await this.serpApiOverviewByToken(overview.page_token, key)) ?? overview;
      }
      if (!overview) {
        return this.errored(engine, 'No AI Overview shown for this query', true);
      }
      const text = this.flattenBlocks(overview?.text_blocks);
      const refs: any[] = Array.isArray(overview?.references) ? overview.references : [];
      const sources = this.dedupe(refs.map((r) => r?.link).filter(Boolean));
      const cited =
        this.textHasBrand(text, brand) ||
        this.sourcesHaveBrand(sources, brand) ||
        refs.some((r) => this.textHasBrand(`${r?.source ?? ''} ${r?.title ?? ''}`, brand));
      return { engine, configured: true, cited, mention: this.snippet(text, brand), sources };
    } catch (e: any) {
      return this.errored(engine, e?.message ?? 'request failed');
    }
  }

  private async serpApiOverview(query: string, key: string): Promise<any> {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', key);
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
    return data?.ai_overview;
  }

  private async serpApiOverviewByToken(pageToken: string, key: string): Promise<any> {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google_ai_overview');
    url.searchParams.set('page_token', pageToken);
    url.searchParams.set('api_key', key);
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
    return data?.ai_overview;
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  private notConfigured(engine: string): EngineResult {
    return { engine, configured: false, cited: false, mention: null, sources: [] };
  }

  private errored(engine: string, error: string, configured = true): EngineResult {
    return { engine, configured, cited: false, mention: null, sources: [], error };
  }

  private dedupe(urls: string[]): string[] {
    return [...new Set(urls.filter((u): u is string => typeof u === 'string'))];
  }

  private textHasBrand(text: string, brand: Brand): boolean {
    const t = (text ?? '').toLowerCase();
    return t.includes(brand.domain.toLowerCase()) || t.includes(brand.name.toLowerCase());
  }

  private sourcesHaveBrand(sources: string[], brand: Brand): boolean {
    const d = brand.domain.toLowerCase();
    return sources.some((u) => u.toLowerCase().includes(d));
  }

  // Recursively pull all snippet text out of a SerpApi text_blocks tree.
  private flattenBlocks(blocks: any): string {
    const parts: string[] = [];
    const walk = (arr: any) => {
      for (const b of Array.isArray(arr) ? arr : []) {
        if (typeof b?.snippet === 'string') parts.push(b.snippet);
        if (Array.isArray(b?.list)) walk(b.list);
        if (Array.isArray(b?.text_blocks)) walk(b.text_blocks);
      }
    };
    walk(blocks);
    return parts.join(' ');
  }

  // A short excerpt around the brand mention, or the opening of the answer.
  private snippet(text: string, brand: Brand): string | null {
    if (!text) return null;
    const lower = text.toLowerCase();
    const name = brand.name.toLowerCase();
    const domain = brand.domain.toLowerCase();
    const needle = lower.includes(name) ? name : lower.includes(domain) ? domain : null;
    if (!needle) {
      const head = text.slice(0, 220).trim();
      return head + (text.length > 220 ? '…' : '');
    }
    const idx = lower.indexOf(needle);
    const start = Math.max(0, idx - 90);
    const end = Math.min(text.length, idx + needle.length + 130);
    return (
      (start > 0 ? '…' : '') +
      text.slice(start, end).trim() +
      (end < text.length ? '…' : '')
    );
  }
}
