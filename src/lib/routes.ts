// ─── Route-level long-tail landing pages ─────────────────────────────
// Drives /transfers/[city]/[route] — one page per airport→destination
// route (e.g. "Hurghada Airport to El Gouna"). Copy is generated from a
// per-locale template pack filled with route facts (distance, duration),
// so every page is genuinely unique AND fully localized server-side.

import { DESTINATIONS, getDestination, type Destination, type RouteInfo } from './destinations';
import type { Locale } from './i18n-config';

export interface ResolvedRoute {
  dest: Destination;
  route: RouteInfo;
}

// Look up a city+route pair. Returns undefined if either is unknown.
export function getRoute(citySlug: string, routeSlug: string): ResolvedRoute | undefined {
  const dest = getDestination(citySlug);
  const route = dest?.routes.find((r) => r.slug === routeSlug);
  return dest && route ? { dest, route } : undefined;
}

// Every (city, route) pair — for generateStaticParams and the sitemap.
export function allRoutes(): { city: string; route: string }[] {
  return DESTINATIONS.flatMap((d) => d.routes.map((r) => ({ city: d.slug, route: r.slug })));
}

/* ------------------------------------------------------------------ */
/*  Localized copy                                                     */
/* ------------------------------------------------------------------ */

export interface RouteCopy {
  title: string;
  metaDescription: string;
  kicker: string; // small badge above the H1
  h1: string;
  subtitle: string;
  intro: string[];
  info: { label: string; value: string }[];
  otherRoutesTitle: string;
  faqTitle: string;
  faqs: { question: string; answer: string }[];
  bookCta: string;
  ctaTitle: string;
  ctaDesc: string;
}

// A template pack uses placeholders: {airport} {iata} {to} {city}
// {distance} {duration}. Proper nouns and numbers are injected as-is.
interface RoutePack {
  title: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  subtitle: string;
  intro1: string;
  intro2: string;
  distanceLabel: string;
  durationLabel: string;
  priceLabel: string;
  priceValue: string;
  kmUnit: string; // "{distance} km"
  minUnit: string; // "≈ {duration} min"
  otherRoutesTitle: string;
  faqTitle: string;
  faq1q: string;
  faq1a: string;
  faq2q: string;
  faq2a: string;
  faq3q: string;
  faq3a: string;
  bookCta: string;
  ctaTitle: string;
  ctaDesc: string;
}

const PACKS: Record<Locale, RoutePack> = {
  en: {
    title: '{city} Airport to {to} Transfer ({iata}) | Transfera',
    metaDescription:
      'Private {city} Airport ({iata}) transfer to {to} — about {distance} km, {duration} min. Fixed price, flight tracking, free cancellation, 24/7 support.',
    kicker: 'Private Airport Transfer',
    h1: '{airport} to {to}',
    subtitle:
      'Private door-to-door transfer from {airport} ({iata}) to {to} — about {distance} km, roughly {duration} minutes. Fixed price, flight tracking and free cancellation.',
    intro1:
      'Book a private airport transfer from {airport} ({iata}) directly to {to} with Transfera. Your professional, English-speaking driver meets you in the arrivals hall, helps with your luggage and takes you straight to your accommodation — no shared shuttles, no waiting and no haggling over the fare.',
    intro2:
      'The journey from the airport to {to} is approximately {distance} km and takes about {duration} minutes in normal traffic. Your fare is fixed at the time of booking with no meter and no surge pricing, we track your flight so your driver is always there on time, and free cancellation is available up to 24 hours before pickup.',
    distanceLabel: 'Distance',
    durationLabel: 'Journey time',
    priceLabel: 'Pricing',
    priceValue: 'Fixed, all-in',
    kmUnit: '{distance} km',
    minUnit: '≈ {duration} min',
    otherRoutesTitle: 'Other {city} transfer routes',
    faqTitle: 'Frequently asked questions',
    faq1q: 'How long is the transfer from {city} Airport to {to}?',
    faq1a:
      'The drive from {airport} to {to} is approximately {distance} km and takes about {duration} minutes in normal traffic. Your driver takes the fastest safe route.',
    faq2q: 'How much does a {city} Airport to {to} transfer cost?',
    faq2a:
      'Your price is fixed and confirmed at the time of booking — there is no meter and no surge pricing. Enter your details to see the exact fare instantly, with free cancellation up to 24 hours before pickup.',
    faq3q: 'What happens if my flight is delayed?',
    faq3a:
      'We track your flight in real time, so if you land early or late your driver adjusts and is waiting for you at no extra charge.',
    bookCta: 'Book this transfer',
    ctaTitle: 'Book your {airport} to {to} transfer',
    ctaDesc: 'Instant price, secure booking, and a driver waiting when you land.',
  },
  ar: {
    title: 'نقل من مطار {city} إلى {to} ({iata}) | Transfera',
    metaDescription:
      'نقل خاص من مطار {city} ({iata}) إلى {to} — حوالي {distance} كم، {duration} دقيقة. سعر ثابت، تتبع الرحلات، إلغاء مجاني، دعم على مدار الساعة.',
    kicker: 'نقل خاص من المطار',
    h1: 'من {airport} إلى {to}',
    subtitle:
      'نقل خاص من الباب إلى الباب من {airport} ({iata}) إلى {to} — حوالي {distance} كم، نحو {duration} دقيقة. سعر ثابت، تتبع الرحلات وإلغاء مجاني.',
    intro1:
      'احجز نقلاً خاصاً من {airport} ({iata}) مباشرة إلى {to} مع Transfera. يستقبلك سائق محترف يتحدث الإنجليزية في صالة الوصول، ويساعدك في حمل أمتعتك ويأخذك مباشرة إلى مكان إقامتك — بدون حافلات مشتركة وبدون انتظار وبدون مساومة على الأجرة.',
    intro2:
      'تبلغ مسافة الرحلة من المطار إلى {to} حوالي {distance} كم وتستغرق نحو {duration} دقيقة في حركة المرور العادية. يتم تثبيت سعرك عند الحجز بدون عداد وبدون أسعار متغيرة، ونتتبع رحلتك ليكون سائقك دائماً في موعده، والإلغاء مجاني حتى 24 ساعة قبل الاستلام.',
    distanceLabel: 'المسافة',
    durationLabel: 'مدة الرحلة',
    priceLabel: 'السعر',
    priceValue: 'ثابت وشامل',
    kmUnit: '{distance} كم',
    minUnit: '≈ {duration} دقيقة',
    otherRoutesTitle: 'مسارات نقل أخرى في {city}',
    faqTitle: 'الأسئلة الشائعة',
    faq1q: 'كم تستغرق رحلة النقل من مطار {city} إلى {to}؟',
    faq1a:
      'تبلغ مسافة القيادة من {airport} إلى {to} حوالي {distance} كم وتستغرق نحو {duration} دقيقة في حركة المرور العادية. يسلك سائقك أسرع طريق آمن.',
    faq2q: 'كم تكلفة النقل من مطار {city} إلى {to}؟',
    faq2a:
      'سعرك ثابت ومؤكد عند الحجز — لا يوجد عداد ولا أسعار متغيرة. أدخل بياناتك لرؤية الأجرة الدقيقة فوراً، مع إلغاء مجاني حتى 24 ساعة قبل الاستلام.',
    faq3q: 'ماذا يحدث إذا تأخرت رحلتي؟',
    faq3a:
      'نتتبع رحلتك في الوقت الفعلي، لذا إذا هبطت مبكراً أو متأخراً يعدّل سائقك موعده وينتظرك دون أي رسوم إضافية.',
    bookCta: 'احجز هذا النقل',
    ctaTitle: 'احجز نقلك من {airport} إلى {to}',
    ctaDesc: 'سعر فوري، حجز آمن، وسائق في انتظارك عند الهبوط.',
  },
  de: {
    title: '{city} Flughafen nach {to} Transfer ({iata}) | Transfera',
    metaDescription:
      'Privater Transfer vom Flughafen {city} ({iata}) nach {to} — ca. {distance} km, {duration} Min. Festpreis, Flugverfolgung, kostenlose Stornierung, 24/7.',
    kicker: 'Privater Flughafentransfer',
    h1: '{airport} nach {to}',
    subtitle:
      'Privater Tür-zu-Tür-Transfer vom {airport} ({iata}) nach {to} — ca. {distance} km, etwa {duration} Minuten. Festpreis, Flugverfolgung und kostenlose Stornierung.',
    intro1:
      'Buchen Sie mit Transfera einen privaten Flughafentransfer vom {airport} ({iata}) direkt nach {to}. Ihr professioneller, englischsprachiger Fahrer empfängt Sie in der Ankunftshalle, hilft Ihnen mit dem Gepäck und bringt Sie direkt zu Ihrer Unterkunft — keine Sammeltransfers, kein Warten und kein Feilschen um den Fahrpreis.',
    intro2:
      'Die Fahrt vom Flughafen nach {to} beträgt etwa {distance} km und dauert bei normalem Verkehr rund {duration} Minuten. Ihr Fahrpreis wird bei der Buchung festgelegt — ohne Taxameter und ohne Aufschläge. Wir verfolgen Ihren Flug, damit Ihr Fahrer immer pünktlich ist, und kostenlose Stornierung ist bis 24 Stunden vor Abholung möglich.',
    distanceLabel: 'Entfernung',
    durationLabel: 'Fahrzeit',
    priceLabel: 'Preis',
    priceValue: 'Festpreis, alles inklusive',
    kmUnit: '{distance} km',
    minUnit: '≈ {duration} Min.',
    otherRoutesTitle: 'Weitere Transferrouten in {city}',
    faqTitle: 'Häufig gestellte Fragen',
    faq1q: 'Wie lange dauert der Transfer vom Flughafen {city} nach {to}?',
    faq1a:
      'Die Fahrt vom {airport} nach {to} beträgt etwa {distance} km und dauert bei normalem Verkehr rund {duration} Minuten. Ihr Fahrer nimmt die schnellste sichere Route.',
    faq2q: 'Was kostet ein Transfer vom Flughafen {city} nach {to}?',
    faq2a:
      'Ihr Preis ist fest und wird bei der Buchung bestätigt — ohne Taxameter und ohne Aufschläge. Geben Sie Ihre Daten ein, um sofort den genauen Fahrpreis zu sehen, mit kostenloser Stornierung bis 24 Stunden vor Abholung.',
    faq3q: 'Was passiert, wenn mein Flug Verspätung hat?',
    faq3a:
      'Wir verfolgen Ihren Flug in Echtzeit. Wenn Sie früher oder später landen, passt sich Ihr Fahrer an und wartet ohne Aufpreis auf Sie.',
    bookCta: 'Diesen Transfer buchen',
    ctaTitle: 'Buchen Sie Ihren Transfer vom {airport} nach {to}',
    ctaDesc: 'Sofortpreis, sichere Buchung und ein Fahrer, der bei Ihrer Landung wartet.',
  },
  fr: {
    title: 'Transfert aéroport {city} vers {to} ({iata}) | Transfera',
    metaDescription:
      "Transfert privé de l'aéroport de {city} ({iata}) vers {to} — environ {distance} km, {duration} min. Prix fixe, suivi des vols, annulation gratuite, 24/7.",
    kicker: 'Transfert aéroport privé',
    h1: '{airport} vers {to}',
    subtitle:
      "Transfert privé porte-à-porte de {airport} ({iata}) vers {to} — environ {distance} km, environ {duration} minutes. Prix fixe, suivi des vols et annulation gratuite.",
    intro1:
      "Réservez un transfert aéroport privé de {airport} ({iata}) directement vers {to} avec Transfera. Votre chauffeur professionnel anglophone vous accueille dans le hall des arrivées, vous aide avec vos bagages et vous conduit directement à votre hébergement — sans navette partagée, sans attente et sans marchandage.",
    intro2:
      "Le trajet de l'aéroport vers {to} est d'environ {distance} km et prend environ {duration} minutes en circulation normale. Votre tarif est fixé au moment de la réservation, sans compteur ni majoration. Nous suivons votre vol pour que votre chauffeur soit toujours à l'heure, et l'annulation est gratuite jusqu'à 24 heures avant la prise en charge.",
    distanceLabel: 'Distance',
    durationLabel: 'Durée du trajet',
    priceLabel: 'Tarif',
    priceValue: 'Fixe, tout compris',
    kmUnit: '{distance} km',
    minUnit: '≈ {duration} min',
    otherRoutesTitle: 'Autres trajets de transfert à {city}',
    faqTitle: 'Questions fréquentes',
    faq1q: "Combien de temps dure le transfert de l'aéroport de {city} vers {to} ?",
    faq1a:
      "Le trajet de {airport} vers {to} est d'environ {distance} km et prend environ {duration} minutes en circulation normale. Votre chauffeur emprunte l'itinéraire sûr le plus rapide.",
    faq2q: "Combien coûte un transfert de l'aéroport de {city} vers {to} ?",
    faq2a:
      "Votre prix est fixe et confirmé au moment de la réservation — sans compteur ni majoration. Saisissez vos informations pour voir le tarif exact instantanément, avec annulation gratuite jusqu'à 24 heures avant la prise en charge.",
    faq3q: 'Que se passe-t-il si mon vol est retardé ?',
    faq3a:
      "Nous suivons votre vol en temps réel : si vous atterrissez en avance ou en retard, votre chauffeur s'adapte et vous attend sans frais supplémentaires.",
    bookCta: 'Réserver ce transfert',
    ctaTitle: 'Réservez votre transfert de {airport} vers {to}',
    ctaDesc: "Prix instantané, réservation sécurisée et un chauffeur qui vous attend à l'atterrissage.",
  },
  it: {
    title: 'Transfer aeroporto {city} per {to} ({iata}) | Transfera',
    metaDescription:
      "Transfer privato dall'aeroporto di {city} ({iata}) per {to} — circa {distance} km, {duration} min. Prezzo fisso, monitoraggio voli, cancellazione gratuita, 24/7.",
    kicker: 'Transfer aeroportuale privato',
    h1: '{airport} per {to}',
    subtitle:
      "Transfer privato porta a porta da {airport} ({iata}) per {to} — circa {distance} km, circa {duration} minuti. Prezzo fisso, monitoraggio voli e cancellazione gratuita.",
    intro1:
      "Prenota con Transfera un transfer aeroportuale privato da {airport} ({iata}) direttamente per {to}. Il tuo autista professionale di lingua inglese ti accoglie nella sala arrivi, ti aiuta con i bagagli e ti porta direttamente al tuo alloggio — niente navette condivise, niente attese e niente contrattazioni sul prezzo.",
    intro2:
      "Il tragitto dall'aeroporto per {to} è di circa {distance} km e richiede circa {duration} minuti con traffico normale. La tua tariffa è fissata al momento della prenotazione, senza tassametro e senza sovrapprezzi. Monitoriamo il tuo volo affinché l'autista sia sempre puntuale, e la cancellazione è gratuita fino a 24 ore prima del ritiro.",
    distanceLabel: 'Distanza',
    durationLabel: 'Durata del tragitto',
    priceLabel: 'Tariffa',
    priceValue: 'Fissa, tutto incluso',
    kmUnit: '{distance} km',
    minUnit: '≈ {duration} min',
    otherRoutesTitle: 'Altri percorsi di transfer a {city}',
    faqTitle: 'Domande frequenti',
    faq1q: "Quanto dura il transfer dall'aeroporto di {city} per {to}?",
    faq1a:
      "Il tragitto da {airport} per {to} è di circa {distance} km e richiede circa {duration} minuti con traffico normale. Il tuo autista segue il percorso sicuro più rapido.",
    faq2q: "Quanto costa un transfer dall'aeroporto di {city} per {to}?",
    faq2a:
      "Il tuo prezzo è fisso e confermato al momento della prenotazione — senza tassametro e senza sovrapprezzi. Inserisci i tuoi dati per vedere subito la tariffa esatta, con cancellazione gratuita fino a 24 ore prima del ritiro.",
    faq3q: 'Cosa succede se il mio volo è in ritardo?',
    faq3a:
      "Monitoriamo il tuo volo in tempo reale: se atterri in anticipo o in ritardo, il tuo autista si adatta e ti aspetta senza costi aggiuntivi.",
    bookCta: 'Prenota questo transfer',
    ctaTitle: 'Prenota il tuo transfer da {airport} per {to}',
    ctaDesc: "Prezzo immediato, prenotazione sicura e un autista che ti aspetta all'atterraggio.",
  },
  nl: {
    title: 'Transfer luchthaven {city} naar {to} ({iata}) | Transfera',
    metaDescription:
      'Privételuchthaventransfer van {city} ({iata}) naar {to} — ongeveer {distance} km, {duration} min. Vaste prijs, vluchtvolging, gratis annulering, 24/7.',
    kicker: 'Privé luchthaventransfer',
    h1: '{airport} naar {to}',
    subtitle:
      'Privé deur-tot-deur transfer van {airport} ({iata}) naar {to} — ongeveer {distance} km, circa {duration} minuten. Vaste prijs, vluchtvolging en gratis annulering.',
    intro1:
      'Boek met Transfera een privé luchthaventransfer van {airport} ({iata}) rechtstreeks naar {to}. Uw professionele, Engelssprekende chauffeur ontvangt u in de aankomsthal, helpt met uw bagage en brengt u direct naar uw accommodatie — geen gedeelde shuttles, geen wachten en geen onderhandelen over de prijs.',
    intro2:
      'De rit van de luchthaven naar {to} is ongeveer {distance} km en duurt bij normaal verkeer circa {duration} minuten. Uw tarief staat bij het boeken vast, zonder meter en zonder toeslagen. We volgen uw vlucht zodat uw chauffeur altijd op tijd is, en gratis annuleren kan tot 24 uur voor ophalen.',
    distanceLabel: 'Afstand',
    durationLabel: 'Reistijd',
    priceLabel: 'Prijs',
    priceValue: 'Vast, alles inbegrepen',
    kmUnit: '{distance} km',
    minUnit: '≈ {duration} min',
    otherRoutesTitle: 'Andere transferroutes in {city}',
    faqTitle: 'Veelgestelde vragen',
    faq1q: 'Hoe lang duurt de transfer van luchthaven {city} naar {to}?',
    faq1a:
      'De rit van {airport} naar {to} is ongeveer {distance} km en duurt bij normaal verkeer circa {duration} minuten. Uw chauffeur neemt de snelste veilige route.',
    faq2q: 'Wat kost een transfer van luchthaven {city} naar {to}?',
    faq2a:
      'Uw prijs staat vast en wordt bij het boeken bevestigd — zonder meter en zonder toeslagen. Voer uw gegevens in om direct het exacte tarief te zien, met gratis annulering tot 24 uur voor ophalen.',
    faq3q: 'Wat gebeurt er als mijn vlucht vertraagd is?',
    faq3a:
      'We volgen uw vlucht in realtime, dus als u eerder of later landt, past uw chauffeur zich aan en wacht hij zonder extra kosten op u.',
    bookCta: 'Boek deze transfer',
    ctaTitle: 'Boek uw transfer van {airport} naar {to}',
    ctaDesc: 'Directe prijs, veilig boeken en een chauffeur die op u wacht bij de landing.',
  },
  ru: {
    title: 'Трансфер из аэропорта {city} в {to} ({iata}) | Transfera',
    metaDescription:
      'Частный трансфер из аэропорта {city} ({iata}) в {to} — около {distance} км, {duration} мин. Фиксированная цена, отслеживание рейса, бесплатная отмена, 24/7.',
    kicker: 'Частный трансфер из аэропорта',
    h1: 'Из {airport} в {to}',
    subtitle:
      'Частный трансфер «от двери до двери» из {airport} ({iata}) в {to} — около {distance} км, примерно {duration} минут. Фиксированная цена, отслеживание рейса и бесплатная отмена.',
    intro1:
      'Закажите частный трансфер из {airport} ({iata}) напрямую в {to} с Transfera. Профессиональный англоговорящий водитель встретит вас в зале прилёта, поможет с багажом и отвезёт прямо к месту проживания — без общих шаттлов, ожидания и торга за тариф.',
    intro2:
      'Поездка из аэропорта в {to} составляет около {distance} км и занимает примерно {duration} минут при обычном трафике. Стоимость фиксируется при бронировании — без счётчика и без надбавок. Мы отслеживаем ваш рейс, чтобы водитель всегда был вовремя, а бесплатная отмена доступна за 24 часа до подачи.',
    distanceLabel: 'Расстояние',
    durationLabel: 'Время в пути',
    priceLabel: 'Цена',
    priceValue: 'Фиксированная, всё включено',
    kmUnit: '{distance} км',
    minUnit: '≈ {duration} мин',
    otherRoutesTitle: 'Другие маршруты трансфера в {city}',
    faqTitle: 'Частые вопросы',
    faq1q: 'Сколько занимает трансфер из аэропорта {city} в {to}?',
    faq1a:
      'Поездка из {airport} в {to} составляет около {distance} км и занимает примерно {duration} минут при обычном трафике. Водитель выбирает самый быстрый безопасный маршрут.',
    faq2q: 'Сколько стоит трансфер из аэропорта {city} в {to}?',
    faq2a:
      'Ваша цена фиксирована и подтверждается при бронировании — без счётчика и без надбавок. Введите данные, чтобы сразу увидеть точный тариф, с бесплатной отменой за 24 часа до подачи.',
    faq3q: 'Что произойдёт, если мой рейс задержат?',
    faq3a:
      'Мы отслеживаем ваш рейс в реальном времени, поэтому при раннем или позднем прилёте водитель подстроится и будет ждать вас без дополнительной платы.',
    bookCta: 'Забронировать трансфер',
    ctaTitle: 'Закажите трансфер из {airport} в {to}',
    ctaDesc: 'Мгновенная цена, безопасное бронирование и водитель, ожидающий вас при посадке.',
  },
};

// Fill {placeholders} from the route facts.
function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function buildRouteCopy(
  locale: string,
  dest: Destination,
  route: RouteInfo,
): RouteCopy {
  const pack = PACKS[(locale as Locale)] ?? PACKS.en;
  const vars = {
    airport: dest.airportName,
    iata: dest.iata,
    to: route.to,
    city: dest.city,
    distance: route.distanceKm,
    duration: route.durationMin,
  };
  const f = (s: string) => fill(s, vars);

  return {
    title: f(pack.title),
    metaDescription: f(pack.metaDescription),
    kicker: f(pack.kicker),
    h1: f(pack.h1),
    subtitle: f(pack.subtitle),
    intro: [f(pack.intro1), f(pack.intro2)],
    info: [
      { label: f(pack.distanceLabel), value: f(pack.kmUnit) },
      { label: f(pack.durationLabel), value: f(pack.minUnit) },
      { label: f(pack.priceLabel), value: f(pack.priceValue) },
    ],
    otherRoutesTitle: f(pack.otherRoutesTitle),
    faqTitle: f(pack.faqTitle),
    faqs: [
      { question: f(pack.faq1q), answer: f(pack.faq1a) },
      { question: f(pack.faq2q), answer: f(pack.faq2a) },
      { question: f(pack.faq3q), answer: f(pack.faq3a) },
    ],
    bookCta: f(pack.bookCta),
    ctaTitle: f(pack.ctaTitle),
    ctaDesc: f(pack.ctaDesc),
  };
}
