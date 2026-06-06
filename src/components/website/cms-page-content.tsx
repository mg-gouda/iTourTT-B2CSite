'use client';

import { ContactForm } from './contact-form';

// Matches [contact-form] (case-insensitive, whitespace-tolerant) and optionally
// strips the enclosing empty <p>…</p> a rich-text editor commonly wraps it in.
const SHORTCODE_RE = /(?:<p[^>]*>\s*)?\[\s*contact-form\s*\](?:\s*<\/p>)?/gi;

interface Segment {
  type: 'html' | 'form';
  html?: string;
}

function parse(content: string): Segment[] {
  const segments: Segment[] = [];
  const re = new RegExp(SHORTCODE_RE.source, SHORTCODE_RE.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'html', html: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'form' });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'html', html: content.slice(lastIndex) });
  }

  return segments;
}

export function CmsPageContent({ html }: { html: string }) {
  const segments = parse(html);

  // Fast path: no shortcode — identical to previous behaviour.
  if (segments.length === 1 && segments[0].type === 'html') {
    return (
      <div
        className="prose prose-lg mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="mt-8">
      {segments.map((seg, i) =>
        seg.type === 'form' ? (
          <ContactForm key={i} />
        ) : seg.html ? (
          <div
            key={i}
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        ) : null,
      )}
    </div>
  );
}
