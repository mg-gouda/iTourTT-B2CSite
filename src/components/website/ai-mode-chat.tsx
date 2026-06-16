'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Loader2, Mic, Volume2, VolumeX } from 'lucide-react';
import { useBookingStore } from '@/stores/booking-store';
import { useWT, useLocale, useLocalePath, type Locale } from '@/lib/website-i18n';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

// BCP-47 tags for the Web Speech APIs, keyed by the site's UI locale. Arabic
// uses the Egyptian variant since these are Egypt-based transfer bookings.
const SPEECH_LANG: Record<Locale, string> = {
  en: 'en-US',
  ar: 'ar-EG',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  nl: 'nl-NL',
  ru: 'ru-RU',
};

// ---- Minimal typings for the Web Speech API (not in lib.dom for all targets).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CompleteQuery {
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
  vehicleTypeId: string;
  vehicleTypeName: string;
  quotePrice: number;
  quoteCurrency: string;
  seatCapacity: number;
  driverTip: number;
  returnQuotePrice?: number | null;
  flightNo?: string;
  carrier?: string;
  terminal?: string;
  returnFlightNo?: string;
  returnCarrier?: string;
  returnTerminal?: string;
  customExtras?: { extraId: string; qty: number }[];
}

interface AiResult {
  intent: 'collecting' | 'complete' | 'off_topic' | 'error';
  reply?: string;
  draft?: Record<string, unknown>;
  query?: CompleteQuery;
}

interface Props {
  primaryColor: string;
  cardColor: string;
}

// Strip emoji / pictographs so they aren't read aloud as "grinning face" etc.
const cleanForSpeech = (text: string): string =>
  text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}️]/gu, '').trim();

// Conversational booking panel. Replaces the manual form when the "AI Mode" tab
// is active. Sends the running conversation to /public/ai-search; on a `complete`
// intent it pre-fills the booking store and hands off to the normal /book funnel.
// Supports voice: speech-to-text input (mic) and text-to-speech replies (Web
// Speech API), so guests can book hands-free.
export function AiModeChat({ primaryColor, cardColor }: Props) {
  const t = useWT();
  const locale = useLocale();
  const localePath = useLocalePath();
  const router = useRouter();
  const store = useBookingStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // The evolving booking the backend maintains; resent each turn for continuity.
  const [draft, setDraft] = useState<Record<string, unknown> | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ---- Voice state.
  const [voiceOut, setVoiceOut] = useState(false); // speak assistant replies
  const [listening, setListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Detect browser support + restore the guest's voice-output preference. This
  // must run after mount: `window`/`localStorage` aren't available during SSR,
  // and the values gate which controls render — so a synchronous setState here
  // is intentional (hence the disable).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
      speechSynthesis?: SpeechSynthesis;
    };
    setSttSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    setTtsSupported(!!w.speechSynthesis);
    setVoiceOut(localStorage.getItem('transfera_ai_voice') === '1');
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Speak a reply aloud when voice output is enabled.
  const speak = useCallback(
    (text: string) => {
      if (!voiceOut || typeof window === 'undefined' || !window.speechSynthesis) return;
      const clean = cleanForSpeech(text);
      if (!clean) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = SPEECH_LANG[locale];
      const match = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith(locale));
      if (match) u.voice = match;
      window.speechSynthesis.speak(u);
    },
    [voiceOut, locale],
  );

  // Stop any in-flight speech (on unmount, or when leaving for the funnel).
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => () => {
    stopSpeaking();
    recognitionRef.current?.abort();
  }, [stopSpeaking]);

  const toggleVoiceOut = () => {
    setVoiceOut((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') localStorage.setItem('transfera_ai_voice', next ? '1' : '0');
      if (!next) stopSpeaking();
      return next;
    });
  };

  // A complete booking: pre-fill the whole of funnel steps 1 & 2, then hand off
  // to the normal personal-details page.
  const applyCompleteAndGo = (q: CompleteQuery) => {
    stopSpeaking();
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
    // Vehicle + quote (mirrors /book selectVehicle()).
    store.setField('vehicleTypeId', q.vehicleTypeId);
    store.setField('returnQuotePrice', q.returnQuotePrice ?? null);
    store.setQuote(q.quotePrice, q.quoteCurrency, {
      vehicleType: q.vehicleTypeName,
      seatCapacity: q.seatCapacity,
      driverTip: q.driverTip,
    });
    // Flight (airport transfers).
    store.setField('flightNo', q.flightNo ?? '');
    store.setField('carrier', q.carrier ?? '');
    store.setField('terminal', q.terminal ?? '');
    store.setField('returnFlightNo', q.returnFlightNo ?? '');
    store.setField('returnCarrier', q.returnCarrier ?? '');
    store.setField('returnTerminal', q.returnTerminal ?? '');
    // Extras.
    store.setField('customExtras', q.customExtras ?? []);
    // Keep the guest's selected language on the funnel (unprefixed paths get
    // re-negotiated to Accept-Language by middleware, which would drop it).
    router.push(localePath('/book/details'));
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only send a recent window — the full booking state rides in `draft`, so
        // long conversations don't grow the payload (or hit the server's cap).
        // Also clamp each turn's length: the model's own replies (echoed back)
        // can be long, and would otherwise exceed the per-message size limit.
        body: JSON.stringify({
          messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content.slice(0, 3500) })),
          locale,
          draft,
        }),
      });
      const body = await res.json();
      const result: AiResult = body?.data ?? body;

      if (result.draft) setDraft(result.draft);

      if (result.intent === 'complete' && result.query) {
        if (result.reply) {
          setMessages((m) => [...m, { role: 'assistant', content: result.reply! }]);
          speak(result.reply);
        }
        applyCompleteAndGo(result.query);
        return;
      }
      const reply = result.reply || t('booking.aiError');
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('booking.aiError') }]);
    } finally {
      setLoading(false);
    }
  };

  // Start/stop dictation. The transcript streams into the input box; on a final
  // result we auto-send so voice conversations feel hands-free.
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    stopSpeaking(); // don't talk over the guest
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[locale];
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let transcript = '';
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) isFinal = true;
      }
      setInput(transcript);
      if (isFinal && transcript.trim()) {
        // Speaking implies the guest wants spoken replies back.
        if (!voiceOut) {
          setVoiceOut(true);
          if (typeof window !== 'undefined') localStorage.setItem('transfera_ai_voice', '1');
        }
        send(transcript);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div
      className="flex h-[420px] flex-col overflow-hidden rounded-2xl rounded-tl-none"
      style={{ backgroundColor: cardColor, border: '0.8px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
    >
      {/* Header — Transfera AI Assistant identity + voice-output toggle */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}26`, color: primaryColor }}>
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{t('booking.aiTitle')}</p>
          <p className="truncate text-[11px] text-white/50">{t('booking.aiSubtitle')}</p>
        </div>
        {ttsSupported && (
          <button
            type="button"
            onClick={toggleVoiceOut}
            aria-label={t(voiceOut ? 'booking.aiVoiceOn' : 'booking.aiVoiceOff')}
            aria-pressed={voiceOut}
            title={t(voiceOut ? 'booking.aiVoiceOn' : 'booking.aiVoiceOff')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
            style={voiceOut ? { backgroundColor: `${primaryColor}26`, color: primaryColor } : { color: 'rgba(255,255,255,0.5)' }}
          >
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        )}
      </div>

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
            placeholder={listening ? t('booking.aiListening') : t('booking.aiPlaceholder')}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl bg-white/95 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2"
            style={{ ['--tw-ring-color' as string]: primaryColor }}
          />
          {sttSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              aria-label={t('booking.aiMic')}
              aria-pressed={listening}
              title={t('booking.aiMic')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
              style={
                listening
                  ? { backgroundColor: primaryColor, color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }
              }
            >
              <Mic className={`h-4 w-4 ${listening ? 'animate-pulse' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={() => send()}
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
