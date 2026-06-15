'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useBookingStore } from '@/stores/booking-store';
import { useWT, useLocale } from '@/lib/website-i18n';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiResult {
  intent: 'results' | 'no_route' | 'need_info' | 'off_topic' | 'error';
  reply?: string;
  query?: {
    serviceType: string;
    fromZoneId: string;
    toZoneId: string;
    originAirportId?: string;
    destinationAirportId?: string;
    hotelId?: string;
    hotelName?: string;
    fromPlaceName?: string;
    toPlaceName?: string;
    jobDate: string;
    pickupTime: string;
    paxCount: number;
    roundTrip?: boolean;
    returnDate?: string;
    returnTime?: string;
  };
}

interface Props {
  primaryColor: string;
  cardColor: string;
}

// Conversational booking panel. Replaces the manual form when the "AI Mode" tab
// is active. Sends the running conversation to /public/ai-search; on a `results`
// intent it pre-fills the booking store and hands off to the normal /book funnel.
export function AiModeChat({ primaryColor, cardColor }: Props) {
  const t = useWT();
  const locale = useLocale();
  const router = useRouter();
  const store = useBookingStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const applyResultAndGo = (q: NonNullable<AiResult['query']>) => {
    store.reset();
    store.setField('serviceType', q.serviceType);
    store.setField('fromZoneId', q.fromZoneId);
    store.setField('toZoneId', q.toZoneId);
    store.setField('originAirportId', q.originAirportId ?? '');
    store.setField('destinationAirportId', q.destinationAirportId ?? '');
    store.setField('hotelId', q.hotelId ?? '');
    store.setField('hotelName', q.hotelName ?? '');
    store.setField('fromPlaceName', q.fromPlaceName ?? '');
    store.setField('toPlaceName', q.toPlaceName ?? '');
    store.setField('jobDate', q.jobDate);
    store.setField('pickupTime', q.pickupTime);
    store.setField('paxCount', q.paxCount);
    store.setField('roundTrip', !!q.roundTrip);
    store.setField('returnDate', q.returnDate ?? '');
    store.setField('returnTime', q.returnTime ?? '');
    router.push('/book');
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, locale }),
      });
      const body = await res.json();
      const result: AiResult = body?.data ?? body;

      if (result.intent === 'results' && result.query) {
        if (result.reply) setMessages((m) => [...m, { role: 'assistant', content: result.reply! }]);
        applyResultAndGo(result.query);
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: result.reply || t('booking.aiError') }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('booking.aiError') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-[420px] flex-col overflow-hidden rounded-2xl rounded-tl-none"
      style={{ backgroundColor: cardColor, border: '0.8px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
    >
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Intro bubble */}
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}26`, color: primaryColor }}>
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-sm text-white/90">
            {t('booking.aiIntro')}
          </div>
        </div>

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white" style={{ backgroundColor: primaryColor }}>
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}26`, color: primaryColor }}>
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-sm text-white/90">
                {m.content}
              </div>
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('booking.aiThinking')}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder={t('booking.aiPlaceholder')}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl bg-white/95 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2"
            style={{ ['--tw-ring-color' as string]: primaryColor }}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            aria-label={t('booking.aiSend')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-white/40">{t('booking.aiDisclaimer')}</p>
      </div>
    </div>
  );
}
