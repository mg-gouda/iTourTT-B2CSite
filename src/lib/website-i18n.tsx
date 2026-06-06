"use client";

import { create } from "zustand";
import { useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Locale = "en" | "ar" | "de" | "fr" | "it" | "nl" | "ru";

export interface Language {
  code: Locale;
  label: string;
  dir: "ltr" | "rtl";
}

/* ------------------------------------------------------------------ */
/*  LANGUAGES array                                                    */
/* ------------------------------------------------------------------ */

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
];

/* ------------------------------------------------------------------ */
/*  Zustand store                                                      */
/* ------------------------------------------------------------------ */

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// No persistence — the URL segment is the source of truth.
// LocaleSetup (in app/[locale]/layout.tsx) initialises this from the URL on
// every page load, overriding any previous in-memory value.
export const useLocaleStore = create<LocaleStore>()((set) => ({
  locale: "en",
  setLocale: (locale: Locale) => set({ locale }),
}));

/* ------------------------------------------------------------------ */
/*  Translations                                                       */
/* ------------------------------------------------------------------ */

const translations: Record<Locale, Record<string, string>> = {
  /* ============================  ENGLISH  ============================ */
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.bookNow": "Book Now",
    "nav.trackBooking": "Track Booking",
    "nav.destinations": "Destinations",
    "nav.blog": "Blog",
    "nav.myAccount": "My Account",
    "nav.menu": "Menu",

    // Booking Widget
    "booking.arrivalTransfer": "Arrival Transfer",
    "booking.departureTransfer": "Departure Transfer",
    "booking.arrivalAirport": "Arrival Airport",
    "booking.departureAirport": "Departure Airport",
    "booking.selectAirport": "Select airport",
    "booking.date": "Date",
    "booking.time": "Time",
    "booking.passengers": "Passengers",
    "booking.luggage": "Luggage",
    "booking.addons": "Add-ons & Special Requirements",
    "booking.pickupAirport": "Pickup (Airport Area)",
    "booking.pickupHotel": "Pickup (Hotel / Address)",
    "booking.dropoffHotel": "Drop-off (Hotel / Address)",
    "booking.dropoffAirport": "Drop-off (Airport Area)",
    "booking.searchLocation": "Search location...",
    "booking.babySeat": "Baby Seat",
    "booking.boosterSeat": "Booster Seat",
    "booking.wheelchair": "Wheelchair",
    "booking.getQuote": "Get Instant Quote",
    "booking.gettingQuote": "Getting Quote...",
    "booking.yourPrice": "Your Price",
    "booking.bookNow": "Book Now",

    // Landing Page
    "landing.howItWorks": "How It Works",
    "landing.threeSteps": "Book your transfer in three simple steps",
    "landing.step1Title": "Search",
    "landing.step1Desc":
      "Enter your trip details — pickup, drop-off, date, and passengers — to get an instant price quote.",
    "landing.step2Title": "Book & Pay",
    "landing.step2Desc":
      "Fill in your details, choose extras if needed, and pay securely online or opt to pay on arrival.",
    "landing.step3Title": "Travel",
    "landing.step3Desc":
      "Receive your confirmation, meet your driver at the airport, and enjoy a smooth, comfortable transfer.",
    "landing.happyTravelers": "Happy Travelers",
    "landing.onTimeRate": "On-Time Rate",
    "landing.customerSupport": "Customer Support",
    "landing.averageRating": "Average Rating",
    "landing.guestsSay": "What Our Guests Say",
    "landing.theDifference": "The Difference",
    "landing.noHiddenFees": "No hidden fees — transparent pricing",
    "landing.freeCancellation": "Free cancellation up to 24 hours before",
    "landing.flightTracking": "Real-time flight tracking for arrivals",
    "landing.proDrivers": "Professional, English-speaking drivers",
    "landing.modernVehicles": "Modern, air-conditioned vehicles",
    "landing.doorToDoor": "Door-to-door service across Egypt",
    "landing.readyToBook": "Ready to Book Your Transfer?",
    "landing.instantQuote":
      "Get an instant quote and book in under 2 minutes",

    // Track Booking
    "track.title": "Track Your Booking",
    "track.enterRef":
      "Enter your booking reference to check the status of your transfer.",
    "track.reference": "Booking Reference",
    "track.placeholder": "e.g. GB-240101-0001",
    "track.search": "Track",
    "track.notFound": "Booking not found. Please check the reference and try again.",
    "track.bookingDetails": "Booking Details",
    "track.tripInfo": "Trip Information",
    "track.guestInfo": "Guest Information",
    "track.flightDetails": "Flight Details",
    "track.payment": "Payment",
    "track.service": "Service",
    "track.date": "Date",
    "track.pickupTime": "Pickup Time",
    "track.passengers": "Passengers",
    "track.from": "From",
    "track.to": "To",
    "track.hotel": "Hotel",
    "track.vehicle": "Vehicle",
    "track.name": "Name",
    "track.email": "Email",
    "track.phone": "Phone",
    "track.country": "Country",
    "track.flight": "Flight",
    "track.airline": "Airline",
    "track.terminal": "Terminal",
    "track.method": "Method",
    "track.status": "Status",
    "track.total": "Total",
    "track.notes": "Notes",
    "track.payOnArrival": "Pay on Arrival",
    "track.onlinePayment": "Online Payment",
    "track.cancelBooking": "Cancel Booking",
    "track.bookingConfirmed": "Your booking has been confirmed and a driver will be assigned. Driver details will be shared via email before your pickup time.",
    "track.bookingCancelled": "This booking has been cancelled.",
    "track.enterRefAbove": "Enter your booking reference above to view your booking details.",
    "track.statusPending": "Pending",
    "track.statusConfirmed": "Confirmed",
    "track.statusAssigned": "Driver Assigned",
    "track.statusCompleted": "Completed",
    "track.statusCancelled": "Cancelled",
    "track.statusConverted": "Converted to Job",

    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.contactUs": "Contact Us",
    "footer.stayConnected": "Stay Connected",
    "footer.followUs":
      "Follow us on social media for updates, travel tips, and special offers.",
    "footer.rights": "All rights reserved.",
    "footer.about":
      "Professional airport transfer and transportation services across Egypt.",

    // Features
    "features.subtitle": "Trusted by thousands of travelers every year for reliable, comfortable transfers",
    "features.supportTitle": "24/7 Customer Support",
    "features.supportDesc": "Our dedicated support team is available around the clock to assist you with any questions or changes to your booking.",
    "features.meetGreetTitle": "Meet & Greet Service",
    "features.meetGreetDesc": "Your driver will meet you at arrivals with a name sign, help with luggage, and escort you to your vehicle.",
    "features.driversTitle": "Professional Drivers",
    "features.driversDesc": "Licensed, experienced, and vetted drivers with modern, well-maintained vehicles for a safe and comfortable ride.",
    "features.flightTitle": "Flight Monitoring",
    "features.flightDesc": "We track your flight in real-time and adjust pickup times automatically for delays or early arrivals.",
    "features.noFeesTitle": "No Hidden Fees",
    "features.noFeesDesc": "The price you see is the price you pay. No surge pricing, no unexpected charges, and free cancellation up to 24h before.",
    "features.paymentTitle": "Secure Payment",
    "features.paymentDesc": "Pay securely online or choose to pay your driver on arrival. All transactions are encrypted and protected.",

    // Testimonials
    "testimonial.1.quote": "Excellent service from start to finish. The driver was waiting for us at arrivals and the vehicle was immaculate.",
    "testimonial.1.name": "Sarah M.",
    "testimonial.1.location": "London, UK",
    "testimonial.2.quote": "We booked a day tour to the Pyramids. The driver was friendly, knowledgeable, and made our trip unforgettable.",
    "testimonial.2.name": "Marco R.",
    "testimonial.2.location": "Rome, Italy",
    "testimonial.3.quote": "Very professional. Flight was delayed by 2 hours but they tracked it and the driver was still there. Highly recommend!",
    "testimonial.3.name": "James K.",
    "testimonial.3.location": "Sydney, Australia",

    // Admin-configured site content (used as fallback when locale ≠ en)
    "site.heroTitle": "Book Your Airport Transfer",
    "site.heroSubtitle": "Safe, comfortable, and reliable private transfers across Egypt. From the airport to your hotel, we have got you covered.",
    "site.featuresTitle": "Why Choose Us?",

    // Booking widget sub-components
    "booking.pickDate": "Pick date",
    "booking.pickTime": "Pick time",
    "booking.searchPlaceholder": "Search…",
    "booking.noDestinations": "No destinations found for this airport.",
    "booking.hourMinute": "Hour · Minute",

    // Destination landing pages
    "destination.heroDesc": "Fixed-price private transfers from {airport} ({iata}) to your hotel — flight tracking, free cancellation and 24/7 support.",
    "destination.popularRoutes": "Popular {city} Transfer Routes",
    "destination.fixedPrice": "Fixed price — no hidden fees",
    "destination.freeCancellation": "Free cancellation up to 24h",
    "destination.flightTracking": "Real-time flight tracking",
    "destination.ctaTitle": "Book your {city} airport transfer",
    "destination.ctaDesc": "Instant price, secure booking, and a driver waiting when you land.",

    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Private Airport Transfers · Egypt",
    "landing.airportCoverage": "Airports We Cover in Egypt",
    "landing.airportCoverageDesc": "Private arrival and departure transfers from every major Egyptian airport, direct to your hotel or resort.",
    "landing.faq": "Frequently Asked Questions",
    "booking.search": "Search",
    "booking.anywhereIn": "Anywhere in",

    // FAQ items
    "faq.q1": "How do I book an airport transfer in Egypt?",
    "faq.a1": "Enter your pickup airport, destination, date, and number of passengers on our homepage. You will receive an instant price. Book and pay securely online, or choose to pay on arrival.",
    "faq.q2": "What happens if my flight is delayed?",
    "faq.a2": "We track all flights in real time. If your flight is delayed, we automatically adjust your driver's pickup time at no extra charge.",
    "faq.q3": "Can I cancel my transfer?",
    "faq.a3": "Yes. Free cancellation is available up to 24 hours before your scheduled transfer.",
    "faq.q4": "Which airports in Egypt do you cover?",
    "faq.a4": "We cover all major Egyptian airports: Hurghada (HRG), Cairo (CAI), Sharm El Sheikh (SSH), Luxor (LXR), Aswan (ASW), Marsa Alam (RMF), and Alexandria (HBE).",
    "faq.q5": "Are there any hidden fees?",
    "faq.a5": "No. The price you see at booking is the price you pay. No surge pricing, no airport surcharges, no hidden extras.",

    // Common
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.bookAnother": "Book Another Transfer",
    "common.step": "Step",

    // Contact form
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.phone": "Phone (optional)",
    "contact.subject": "Subject (optional)",
    "contact.message": "Message",
    "contact.send": "Send message",
    "contact.sending": "Sending…",
    "contact.success": "Thanks — we'll get back to you shortly.",
    "contact.errorGeneric": "Something went wrong. Please try again.",
    "contact.errorTooMany": "Please wait a moment and try again.",
    "contact.errorCaptcha": "Captcha verification failed. Please try again.",
    "contact.required": "This field is required.",
    "contact.invalidEmail": "Please enter a valid email address.",
    "contact.namePlaceholder": "Your full name",
    "contact.emailPlaceholder": "your@email.com",
    "contact.phonePlaceholder": "+1 234 567 890",
    "contact.subjectPlaceholder": "What is this about?",
    "contact.messagePlaceholder": "Your message…",

    // Cookie consent
    "cookie.title": "We use cookies",
    "cookie.body": "We use cookies to improve your experience, analyse site traffic, and show relevant content. You can accept all, reject non-essential cookies, or choose which types to allow.",
    "cookie.accept": "Accept All",
    "cookie.reject": "Reject All",
    "cookie.manage": "Manage",
    "cookie.manageTitle": "Cookie Preferences",
    "cookie.essential": "Essential",
    "cookie.essentialDesc": "Required for the site to function. Cannot be disabled.",
    "cookie.analytics": "Analytics",
    "cookie.analyticsDesc": "Help us understand how visitors use the site.",
    "cookie.marketing": "Marketing",
    "cookie.marketingDesc": "Used to show you relevant ads and offers.",
    "cookie.save": "Save preferences",
  },

  /* ============================  ARABIC  ============================= */
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.bookNow": "احجز الآن",
    "nav.destinations": "الوجهات",
    "nav.blog": "المدونة",
    "nav.trackBooking": "تتبع الحجز",
    "nav.myAccount": "حسابي",
    "nav.menu": "القائمة",

    // Booking Widget
    "booking.arrivalTransfer": "انتقال الوصول",
    "booking.departureTransfer": "انتقال المغادرة",
    "booking.arrivalAirport": "مطار الوصول",
    "booking.departureAirport": "مطار المغادرة",
    "booking.selectAirport": "اختر المطار",
    "booking.date": "التاريخ",
    "booking.time": "الوقت",
    "booking.passengers": "الركاب",
    "booking.luggage": "الأمتعة",
    "booking.addons": "الإضافات والمتطلبات الخاصة",
    "booking.pickupAirport": "الاستلام (منطقة المطار)",
    "booking.pickupHotel": "الاستلام (فندق / عنوان)",
    "booking.dropoffHotel": "التوصيل (فندق / عنوان)",
    "booking.dropoffAirport": "التوصيل (منطقة المطار)",
    "booking.searchLocation": "ابحث عن الموقع...",
    "booking.babySeat": "مقعد أطفال رضّع",
    "booking.boosterSeat": "مقعد أطفال مرتفع",
    "booking.wheelchair": "كرسي متحرك",
    "booking.getQuote": "احصل على عرض سعر فوري",
    "booking.gettingQuote": "جارٍ الحصول على عرض السعر...",
    "booking.yourPrice": "السعر الخاص بك",
    "booking.bookNow": "احجز الآن",

    // Landing Page
    "landing.howItWorks": "كيف يعمل",
    "landing.threeSteps": "احجز رحلتك في ثلاث خطوات بسيطة",
    "landing.step1Title": "ابحث",
    "landing.step1Desc":
      "أدخل تفاصيل رحلتك — نقطة الاستلام والتوصيل والتاريخ وعدد الركاب — للحصول على عرض سعر فوري.",
    "landing.step2Title": "احجز وادفع",
    "landing.step2Desc":
      "أدخل بياناتك، واختر الإضافات إن لزم الأمر، وادفع بأمان عبر الإنترنت أو اختر الدفع عند الوصول.",
    "landing.step3Title": "سافر",
    "landing.step3Desc":
      "استلم تأكيد حجزك، وقابل سائقك في المطار، واستمتع برحلة سلسة ومريحة.",
    "landing.happyTravelers": "مسافرون سعداء",
    "landing.onTimeRate": "نسبة الالتزام بالمواعيد",
    "landing.customerSupport": "دعم العملاء",
    "landing.averageRating": "متوسط التقييم",
    "landing.guestsSay": "ماذا يقول ضيوفنا",
    "landing.theDifference": "ما يميزنا",
    "landing.noHiddenFees": "لا رسوم خفية — أسعار شفافة",
    "landing.freeCancellation": "إلغاء مجاني حتى 24 ساعة قبل الموعد",
    "landing.flightTracking": "تتبع الرحلات الجوية في الوقت الفعلي",
    "landing.proDrivers": "سائقون محترفون يتحدثون الإنجليزية",
    "landing.modernVehicles": "مركبات حديثة مكيّفة الهواء",
    "landing.doorToDoor": "خدمة من الباب إلى الباب في جميع أنحاء مصر",
    "landing.readyToBook": "مستعد لحجز رحلتك؟",
    "landing.instantQuote": "احصل على عرض سعر فوري واحجز في أقل من دقيقتين",

    // Track Booking
    "track.title": "تتبع حجزك",
    "track.enterRef":
      "أدخل رقم الحجز المرجعي للتحقق من حالة رحلتك.",
    "track.reference": "رقم الحجز المرجعي",
    "track.placeholder": "مثال: GB-240101-0001",
    "track.search": "تتبع",
    "track.notFound": "لم يتم العثور على الحجز. يرجى التحقق من الرقم المرجعي والمحاولة مرة أخرى.",
    "track.bookingDetails": "تفاصيل الحجز",
    "track.tripInfo": "معلومات الرحلة",
    "track.guestInfo": "معلومات الضيف",
    "track.flightDetails": "تفاصيل الرحلة الجوية",
    "track.payment": "الدفع",
    "track.service": "الخدمة",
    "track.date": "التاريخ",
    "track.pickupTime": "وقت الاستلام",
    "track.passengers": "الركاب",
    "track.from": "من",
    "track.to": "إلى",
    "track.hotel": "الفندق",
    "track.vehicle": "المركبة",
    "track.name": "الاسم",
    "track.email": "البريد الإلكتروني",
    "track.phone": "الهاتف",
    "track.country": "الدولة",
    "track.flight": "الرحلة",
    "track.airline": "شركة الطيران",
    "track.terminal": "الصالة",
    "track.method": "طريقة الدفع",
    "track.status": "الحالة",
    "track.total": "الإجمالي",
    "track.notes": "ملاحظات",
    "track.payOnArrival": "الدفع عند الوصول",
    "track.onlinePayment": "الدفع عبر الإنترنت",
    "track.cancelBooking": "إلغاء الحجز",
    "track.bookingConfirmed": "تم تأكيد حجزك وسيتم تعيين سائق. سيتم مشاركة تفاصيل السائق عبر البريد الإلكتروني قبل موعد الاستلام.",
    "track.bookingCancelled": "تم إلغاء هذا الحجز.",
    "track.enterRefAbove": "أدخل رقم الحجز المرجعي أعلاه لعرض تفاصيل حجزك.",
    "track.statusPending": "قيد الانتظار",
    "track.statusConfirmed": "مؤكد",
    "track.statusAssigned": "تم تعيين سائق",
    "track.statusCompleted": "مكتمل",
    "track.statusCancelled": "ملغي",
    "track.statusConverted": "تم التحويل إلى مهمة",

    // Footer
    "footer.quickLinks": "روابط سريعة",
    "footer.contactUs": "اتصل بنا",
    "footer.stayConnected": "ابقَ على تواصل",
    "footer.followUs":
      "تابعنا على وسائل التواصل الاجتماعي للحصول على التحديثات ونصائح السفر والعروض الخاصة.",
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.about":
      "خدمات نقل احترافية من وإلى المطار في جميع أنحاء مصر.",

    // Features
    "features.subtitle": "موثوق من آلاف المسافرين سنوياً لخدمات نقل موثوقة ومريحة",
    "features.supportTitle": "دعم العملاء على مدار الساعة",
    "features.supportDesc": "فريق الدعم المخصص لدينا متاح على مدار الساعة لمساعدتك في أي استفسارات أو تغييرات على حجزك.",
    "features.meetGreetTitle": "خدمة الاستقبال والترحيب",
    "features.meetGreetDesc": "سيقابلك السائق عند بوابة الوصول بلافتة تحمل اسمك، ويساعدك في الأمتعة، ويرافقك إلى سيارتك.",
    "features.driversTitle": "سائقون محترفون",
    "features.driversDesc": "سائقون مرخصون وذوو خبرة مع مركبات حديثة وجيدة الصيانة لرحلة آمنة ومريحة.",
    "features.flightTitle": "مراقبة الرحلات الجوية",
    "features.flightDesc": "نتتبع رحلتك في الوقت الفعلي ونعدّل أوقات الاستلام تلقائياً عند التأخير أو الوصول المبكر.",
    "features.noFeesTitle": "بدون رسوم خفية",
    "features.noFeesDesc": "السعر الذي تراه هو السعر الذي تدفعه. بدون تسعير متغير أو رسوم غير متوقعة، مع إلغاء مجاني حتى 24 ساعة قبل الموعد.",
    "features.paymentTitle": "دفع آمن",
    "features.paymentDesc": "ادفع بأمان عبر الإنترنت أو اختر الدفع للسائق عند الوصول. جميع المعاملات مشفرة ومحمية.",

    // Testimonials
    "testimonial.1.quote": "خدمة ممتازة من البداية إلى النهاية. كان السائق ينتظرنا عند بوابة الوصول والسيارة كانت نظيفة تماماً.",
    "testimonial.1.name": "سارة م.",
    "testimonial.1.location": "لندن، المملكة المتحدة",
    "testimonial.2.quote": "حجزنا جولة يومية إلى الأهرامات. كان السائق ودوداً ومطلعاً وجعل رحلتنا لا تُنسى.",
    "testimonial.2.name": "ماركو ر.",
    "testimonial.2.location": "روما، إيطاليا",
    "testimonial.3.quote": "احترافية عالية. تأخرت رحلتنا ساعتين لكنهم تتبعوها وكان السائق لا يزال في انتظارنا. أنصح بشدة!",
    "testimonial.3.name": "جيمس ك.",
    "testimonial.3.location": "سيدني، أستراليا",

    // Admin-configured site content
    "site.heroTitle": "احجز نقلتك من المطار",
    "site.heroSubtitle": "خدمات نقل خاصة آمنة ومريحة وموثوقة في جميع أنحاء مصر. من المطار إلى فندقك، نحن هنا لخدمتك.",
    "site.featuresTitle": "لماذا تختارنا؟",

    // Booking widget sub-components
    "booking.pickDate": "اختر التاريخ",
    "booking.pickTime": "اختر الوقت",
    "booking.searchPlaceholder": "بحث...",
    "booking.noDestinations": "لا توجد وجهات لهذا المطار.",
    "booking.hourMinute": "ساعة · دقيقة",

    // Destination landing pages
    "destination.heroDesc": "نقل خاص بسعر ثابت من {airport} ({iata}) إلى فندقك — تتبع الرحلات، إلغاء مجاني، ودعم على مدار الساعة.",
    "destination.popularRoutes": "مسارات النقل الشائعة في {city}",
    "destination.fixedPrice": "سعر ثابت — بدون رسوم خفية",
    "destination.freeCancellation": "إلغاء مجاني حتى 24 ساعة",
    "destination.flightTracking": "تتبع الرحلات في الوقت الفعلي",
    "destination.ctaTitle": "احجز نقلك من مطار {city}",
    "destination.ctaDesc": "سعر فوري، حجز آمن، وسائق في انتظارك عند الهبوط.",

    // Airport Coverage & FAQ sections
    "landing.heroBadge": "نقل خاص من وإلى المطار · مصر",
    "landing.airportCoverage": "المطارات التي نخدمها في مصر",
    "landing.airportCoverageDesc": "خدمات نقل خاصة من وإلى جميع المطارات المصرية الكبرى، مباشرةً إلى فندقك أو منتجعك.",
    "landing.faq": "الأسئلة الشائعة",
    "booking.search": "بحث",
    "booking.anywhereIn": "في أي مكان في",

    // FAQ items
    "faq.q1": "كيف أحجز نقلاً من المطار في مصر؟",
    "faq.a1": "أدخل مطار الاستلام والوجهة والتاريخ وعدد الركاب في الصفحة الرئيسية لتحصل على سعر فوري. احجز وادفع بأمان عبر الإنترنت، أو اختر الدفع عند الوصول.",
    "faq.q2": "ماذا يحدث إذا تأخرت رحلتي الجوية؟",
    "faq.a2": "نتابع جميع الرحلات في الوقت الفعلي. إذا تأخرت رحلتك، نعدّل تلقائياً موعد استلام السائق دون أي تكلفة إضافية.",
    "faq.q3": "هل يمكنني إلغاء الحجز؟",
    "faq.a3": "نعم. الإلغاء مجاني حتى 24 ساعة قبل موعد النقل المحدد.",
    "faq.q4": "ما المطارات التي تغطيها في مصر؟",
    "faq.a4": "نغطي جميع المطارات المصرية الرئيسية: الغردقة (HRG)، القاهرة (CAI)، شرم الشيخ (SSH)، الأقصر (LXR)، أسوان (ASW)، مرسى علم (RMF)، والإسكندرية (HBE).",
    "faq.q5": "هل توجد رسوم خفية؟",
    "faq.a5": "لا. السعر الذي تراه عند الحجز هو السعر الذي تدفعه. لا توجد أسعار متغيرة أو رسوم مطار أو تكاليف مخفية.",

    // Common
    "common.loading": "جارٍ التحميل...",
    "common.error": "حدث خطأ ما",
    "common.bookAnother": "احجز رحلة أخرى",
    "common.step": "الخطوة",

    // Contact form
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.phone": "الهاتف (اختياري)",
    "contact.subject": "الموضوع (اختياري)",
    "contact.message": "الرسالة",
    "contact.send": "إرسال الرسالة",
    "contact.sending": "جارٍ الإرسال…",
    "contact.success": "شكراً — سنرد عليك قريباً.",
    "contact.errorGeneric": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    "contact.errorTooMany": "يرجى الانتظار لحظة والمحاولة مرة أخرى.",
    "contact.errorCaptcha": "فشل التحقق من الكابتشا. يرجى المحاولة مرة أخرى.",
    "contact.required": "هذا الحقل مطلوب.",
    "contact.invalidEmail": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    "contact.namePlaceholder": "اسمك الكامل",
    "contact.emailPlaceholder": "بريدك@الإلكتروني.com",
    "contact.phonePlaceholder": "+1 234 567 890",
    "contact.subjectPlaceholder": "ما موضوع رسالتك؟",
    "contact.messagePlaceholder": "رسالتك…",

    // Cookie consent
    "cookie.title": "نستخدم ملفات تعريف الارتباط",
    "cookie.body": "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة الموقع وعرض محتوى ملائم. يمكنك قبول الكل أو رفض غير الضرورية أو اختيار الأنواع التي تريد السماح بها.",
    "cookie.accept": "قبول الكل",
    "cookie.reject": "رفض الكل",
    "cookie.manage": "إدارة",
    "cookie.manageTitle": "تفضيلات ملفات تعريف الارتباط",
    "cookie.essential": "الضرورية",
    "cookie.essentialDesc": "مطلوبة لعمل الموقع. لا يمكن تعطيلها.",
    "cookie.analytics": "التحليلية",
    "cookie.analyticsDesc": "تساعدنا على فهم كيفية استخدام الزوار للموقع.",
    "cookie.marketing": "التسويقية",
    "cookie.marketingDesc": "تُستخدم لعرض إعلانات وعروض ذات صلة لك.",
    "cookie.save": "حفظ التفضيلات",
  },

  /* ============================  GERMAN  ============================= */
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.bookNow": "Jetzt buchen",
    "nav.trackBooking": "Buchung verfolgen",
    "nav.myAccount": "Mein Konto",
    "nav.menu": "Menü",

    // Booking Widget
    "booking.arrivalTransfer": "Ankunftstransfer",
    "booking.departureTransfer": "Abflugtransfer",
    "booking.arrivalAirport": "Ankunftsflughafen",
    "booking.departureAirport": "Abflughafen",
    "booking.selectAirport": "Flughafen auswählen",
    "booking.date": "Datum",
    "booking.time": "Uhrzeit",
    "booking.passengers": "Passagiere",
    "booking.luggage": "Gepäck",
    "booking.pickupAirport": "Abholung (Flughafenbereich)",
    "booking.pickupHotel": "Abholung (Hotel / Adresse)",
    "booking.dropoffHotel": "Absetzen (Hotel / Adresse)",
    "booking.dropoffAirport": "Absetzen (Flughafenbereich)",
    "booking.searchLocation": "Ort suchen...",
    "booking.babySeat": "Babysitz",
    "booking.boosterSeat": "Kindersitzerhöhung",
    "booking.wheelchair": "Rollstuhl",
    "booking.getQuote": "Sofortangebot erhalten",
    "booking.gettingQuote": "Angebot wird erstellt...",
    "booking.yourPrice": "Ihr Preis",
    "booking.bookNow": "Jetzt buchen",

    // Landing Page
    "landing.howItWorks": "So funktioniert es",
    "landing.threeSteps": "Buchen Sie Ihren Transfer in drei einfachen Schritten",
    "landing.step1Title": "Suchen",
    "landing.step1Desc":
      "Geben Sie Ihre Reisedetails ein — Abholung, Ziel, Datum und Passagieranzahl — und erhalten Sie sofort ein Preisangebot.",
    "landing.step2Title": "Buchen & Bezahlen",
    "landing.step2Desc":
      "Geben Sie Ihre Daten ein, wählen Sie bei Bedarf Extras und bezahlen Sie sicher online oder bei Ankunft.",
    "landing.step3Title": "Reisen",
    "landing.step3Desc":
      "Erhalten Sie Ihre Bestätigung, treffen Sie Ihren Fahrer am Flughafen und genießen Sie einen komfortablen Transfer.",
    "landing.happyTravelers": "Zufriedene Reisende",
    "landing.onTimeRate": "Pünktlichkeitsrate",
    "landing.customerSupport": "Kundenservice",
    "landing.averageRating": "Durchschnittliche Bewertung",
    "landing.guestsSay": "Was unsere Gäste sagen",
    "landing.theDifference": "Der Unterschied",
    "landing.noHiddenFees": "Keine versteckten Gebühren — transparente Preise",
    "landing.freeCancellation":
      "Kostenlose Stornierung bis 24 Stunden vorher",
    "landing.flightTracking":
      "Echtzeit-Flugverfolgung bei Ankünften",
    "landing.proDrivers": "Professionelle, englischsprachige Fahrer",
    "landing.modernVehicles": "Moderne, klimatisierte Fahrzeuge",
    "landing.doorToDoor": "Tür-zu-Tür-Service in ganz Ägypten",
    "landing.readyToBook": "Bereit, Ihren Transfer zu buchen?",
    "landing.instantQuote":
      "Erhalten Sie ein Sofortangebot und buchen Sie in unter 2 Minuten",

    // Track Booking
    "track.title": "Buchung verfolgen",
    "track.enterRef":
      "Geben Sie Ihre Buchungsreferenz ein, um den Status Ihres Transfers zu prüfen.",
    "track.reference": "Buchungsreferenz",
    "track.placeholder": "z. B. GB-240101-0001",
    "track.search": "Verfolgen",
    "track.notFound": "Buchung nicht gefunden. Bitte überprüfen Sie die Referenz und versuchen Sie es erneut.",
    "track.bookingDetails": "Buchungsdetails",
    "track.tripInfo": "Reiseinformationen",
    "track.guestInfo": "Gastinformationen",
    "track.flightDetails": "Flugdetails",
    "track.payment": "Zahlung",
    "track.service": "Service",
    "track.date": "Datum",
    "track.pickupTime": "Abholzeit",
    "track.passengers": "Passagiere",
    "track.from": "Von",
    "track.to": "Nach",
    "track.hotel": "Hotel",
    "track.vehicle": "Fahrzeug",
    "track.name": "Name",
    "track.email": "E-Mail",
    "track.phone": "Telefon",
    "track.country": "Land",
    "track.flight": "Flug",
    "track.airline": "Fluggesellschaft",
    "track.terminal": "Terminal",
    "track.method": "Zahlungsart",
    "track.status": "Status",
    "track.total": "Gesamt",
    "track.notes": "Anmerkungen",
    "track.payOnArrival": "Zahlung bei Ankunft",
    "track.onlinePayment": "Online-Zahlung",
    "track.cancelBooking": "Buchung stornieren",
    "track.bookingConfirmed": "Ihre Buchung wurde bestätigt und ein Fahrer wird zugewiesen. Die Fahrerdetails werden Ihnen vor der Abholzeit per E-Mail mitgeteilt.",
    "track.bookingCancelled": "Diese Buchung wurde storniert.",
    "track.enterRefAbove": "Geben Sie oben Ihre Buchungsreferenz ein, um Ihre Buchungsdetails anzuzeigen.",
    "track.statusPending": "Ausstehend",
    "track.statusConfirmed": "Bestätigt",
    "track.statusAssigned": "Fahrer zugewiesen",
    "track.statusCompleted": "Abgeschlossen",
    "track.statusCancelled": "Storniert",
    "track.statusConverted": "In Auftrag umgewandelt",

    // Footer
    "footer.quickLinks": "Schnellzugriff",
    "footer.contactUs": "Kontakt",
    "footer.stayConnected": "Bleiben Sie verbunden",
    "footer.followUs":
      "Folgen Sie uns in den sozialen Medien für Updates, Reisetipps und Sonderangebote.",
    "footer.rights": "Alle Rechte vorbehalten.",
    "footer.about":
      "Professionelle Flughafentransfer- und Transportdienste in ganz Ägypten.",

    // Features
    "features.subtitle": "Jährlich von Tausenden Reisenden für zuverlässige, komfortable Transfers vertraut",
    "features.supportTitle": "24/7 Kundenservice",
    "features.supportDesc": "Unser engagiertes Support-Team steht Ihnen rund um die Uhr bei Fragen oder Änderungen Ihrer Buchung zur Verfügung.",
    "features.meetGreetTitle": "Meet & Greet Service",
    "features.meetGreetDesc": "Ihr Fahrer erwartet Sie am Ankunftsgate mit einem Namensschild, hilft beim Gepäck und begleitet Sie zum Fahrzeug.",
    "features.driversTitle": "Professionelle Fahrer",
    "features.driversDesc": "Lizenzierte, erfahrene und geprüfte Fahrer mit modernen, gepflegten Fahrzeugen für eine sichere und komfortable Fahrt.",
    "features.flightTitle": "Flugüberwachung",
    "features.flightDesc": "Wir verfolgen Ihren Flug in Echtzeit und passen die Abholzeiten automatisch bei Verspätungen oder frühen Ankünften an.",
    "features.noFeesTitle": "Keine versteckten Gebühren",
    "features.noFeesDesc": "Der angezeigte Preis ist der Preis, den Sie zahlen. Keine Aufpreise, keine unerwarteten Kosten und kostenlose Stornierung bis 24h vorher.",
    "features.paymentTitle": "Sichere Zahlung",
    "features.paymentDesc": "Bezahlen Sie sicher online oder wählen Sie die Zahlung beim Fahrer bei Ankunft. Alle Transaktionen sind verschlüsselt und geschützt.",

    // Testimonials
    "testimonial.1.quote": "Exzellenter Service von Anfang bis Ende. Der Fahrer wartete am Ankunftsgate auf uns und das Fahrzeug war makellos.",
    "testimonial.1.name": "Sarah M.",
    "testimonial.1.location": "London, UK",
    "testimonial.2.quote": "Wir haben eine Tagestour zu den Pyramiden gebucht. Der Fahrer war freundlich, kompetent und hat unsere Reise unvergesslich gemacht.",
    "testimonial.2.name": "Marco R.",
    "testimonial.2.location": "Rom, Italien",
    "testimonial.3.quote": "Sehr professionell. Unser Flug hatte 2 Stunden Verspätung, aber sie haben ihn verfolgt und der Fahrer war trotzdem da. Sehr empfehlenswert!",
    "testimonial.3.name": "James K.",
    "testimonial.3.location": "Sydney, Australien",

    // Admin-configured site content
    "site.heroTitle": "Buchen Sie Ihren Flughafentransfer",
    "site.heroSubtitle": "Sichere, komfortable und zuverlässige private Transfers in ganz Ägypten. Vom Flughafen direkt zu Ihrem Hotel.",
    "site.featuresTitle": "Warum uns wählen?",

    // Booking widget sub-components
    "booking.pickDate": "Datum wählen",
    "booking.pickTime": "Uhrzeit wählen",
    "booking.searchPlaceholder": "Suchen…",
    "booking.noDestinations": "Keine Ziele für diesen Flughafen gefunden.",
    "booking.hourMinute": "Stunde · Minute",
    // Destination landing pages
    "destination.heroDesc": "Private Transfers zum Festpreis ab {airport} ({iata}) zu Ihrem Hotel — Flugverfolgung, kostenlose Stornierung und 24/7-Support.",
    "destination.popularRoutes": "Beliebte Transferrouten in {city}",
    "destination.fixedPrice": "Festpreis — keine versteckten Gebühren",
    "destination.freeCancellation": "Kostenlose Stornierung bis 24h vorher",
    "destination.flightTracking": "Echtzeit-Flugverfolgung",
    "destination.ctaTitle": "Buchen Sie Ihren {city} Flughafentransfer",
    "destination.ctaDesc": "Sofortpreis, sichere Buchung und ein Fahrer, der bei Ihrer Landung wartet.",
    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Private Flughafentransfers · Ägypten",
    "landing.airportCoverage": "Flughäfen in Ägypten",
    "landing.airportCoverageDesc": "Private Ankunfts- und Abreisetransfers von allen großen ägyptischen Flughäfen direkt zu Ihrem Hotel oder Resort.",
    "landing.faq": "Häufig gestellte Fragen",
    "booking.search": "Suchen",
    "booking.anywhereIn": "Überall in",
    "faq.q1": "Wie buche ich einen Flughafentransfer in Ägypten?",
    "faq.a1": "Geben Sie auf unserer Homepage Ihren Abholflughafen, Ihr Ziel, das Datum und die Anzahl der Passagiere ein. Sie erhalten sofort einen Preis. Buchen und bezahlen Sie sicher online oder wählen Sie die Zahlung bei Ankunft.",
    "faq.q2": "Was passiert, wenn mein Flug Verspätung hat?",
    "faq.a2": "Wir verfolgen alle Flüge in Echtzeit. Bei einer Verspätung passen wir die Abholzeit Ihres Fahrers automatisch ohne Aufpreis an.",
    "faq.q3": "Kann ich meinen Transfer stornieren?",
    "faq.a3": "Ja. Eine kostenlose Stornierung ist bis zu 24 Stunden vor Ihrem geplanten Transfer möglich.",
    "faq.q4": "Welche Flughäfen in Ägypten decken Sie ab?",
    "faq.a4": "Wir decken alle großen ägyptischen Flughäfen ab: Hurghada (HRG), Kairo (CAI), Sharm El Sheikh (SSH), Luxor (LXR), Assuan (ASW), Marsa Alam (RMF) und Alexandria (HBE).",
    "faq.q5": "Gibt es versteckte Gebühren?",
    "faq.a5": "Nein. Der bei der Buchung angezeigte Preis ist der Preis, den Sie zahlen. Keine Aufpreise, keine Flughafenzuschläge, keine versteckten Extras.",

    // Common
    "common.loading": "Wird geladen...",
    "common.error": "Etwas ist schiefgelaufen",
    "common.bookAnother": "Einen weiteren Transfer buchen",
    "common.step": "Schritt",

    // Contact form
    "contact.name": "Name",
    "contact.email": "E-Mail",
    "contact.phone": "Telefon (optional)",
    "contact.subject": "Betreff (optional)",
    "contact.message": "Nachricht",
    "contact.send": "Nachricht senden",
    "contact.sending": "Wird gesendet…",
    "contact.success": "Danke — wir melden uns in Kürze bei Ihnen.",
    "contact.errorGeneric": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    "contact.errorTooMany": "Bitte warten Sie einen Moment und versuchen Sie es erneut.",
    "contact.errorCaptcha": "Captcha-Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "contact.required": "Dieses Feld ist erforderlich.",
    "contact.invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    "contact.namePlaceholder": "Ihr vollständiger Name",
    "contact.emailPlaceholder": "ihre@email.de",
    "contact.phonePlaceholder": "+49 123 456 789",
    "contact.subjectPlaceholder": "Worum geht es?",
    "contact.messagePlaceholder": "Ihre Nachricht…",

    // Cookie consent
    "cookie.title": "Wir verwenden Cookies",
    "cookie.body": "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern, den Datenverkehr zu analysieren und relevante Inhalte anzuzeigen. Sie können alle akzeptieren, nicht notwendige ablehnen oder auswählen, welche Typen Sie zulassen möchten.",
    "cookie.accept": "Alle akzeptieren",
    "cookie.reject": "Alle ablehnen",
    "cookie.manage": "Verwalten",
    "cookie.manageTitle": "Cookie-Einstellungen",
    "cookie.essential": "Notwendig",
    "cookie.essentialDesc": "Für die Funktion der Website erforderlich. Kann nicht deaktiviert werden.",
    "cookie.analytics": "Analyse",
    "cookie.analyticsDesc": "Helfen uns zu verstehen, wie Besucher die Website nutzen.",
    "cookie.marketing": "Marketing",
    "cookie.marketingDesc": "Werden verwendet, um Ihnen relevante Werbung und Angebote zu zeigen.",
    "cookie.save": "Einstellungen speichern",
  },

  /* ============================  FRENCH  ============================= */
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.bookNow": "Réserver",
    "nav.trackBooking": "Suivre la réservation",
    "nav.myAccount": "Mon compte",
    "nav.menu": "Menu",

    // Booking Widget
    "booking.arrivalTransfer": "Transfert d'arrivée",
    "booking.departureTransfer": "Transfert de départ",
    "booking.arrivalAirport": "Aéroport d'arrivée",
    "booking.departureAirport": "Aéroport de départ",
    "booking.selectAirport": "Sélectionner un aéroport",
    "booking.date": "Date",
    "booking.time": "Heure",
    "booking.passengers": "Passagers",
    "booking.luggage": "Bagages",
    "booking.pickupAirport": "Prise en charge (zone aéroport)",
    "booking.pickupHotel": "Prise en charge (hôtel / adresse)",
    "booking.dropoffHotel": "Dépose (hôtel / adresse)",
    "booking.dropoffAirport": "Dépose (zone aéroport)",
    "booking.searchLocation": "Rechercher un lieu...",
    "booking.babySeat": "Siège bébé",
    "booking.boosterSeat": "Siège rehausseur",
    "booking.wheelchair": "Fauteuil roulant",
    "booking.getQuote": "Obtenir un devis instantané",
    "booking.gettingQuote": "Devis en cours...",
    "booking.yourPrice": "Votre prix",
    "booking.bookNow": "Réserver",

    // Landing Page
    "landing.howItWorks": "Comment ça marche",
    "landing.threeSteps":
      "Réservez votre transfert en trois étapes simples",
    "landing.step1Title": "Rechercher",
    "landing.step1Desc":
      "Entrez les détails de votre trajet — prise en charge, dépose, date et nombre de passagers — pour obtenir un devis instantané.",
    "landing.step2Title": "Réserver et payer",
    "landing.step2Desc":
      "Renseignez vos informations, choisissez des options si nécessaire, et payez en ligne en toute sécurité ou à l'arrivée.",
    "landing.step3Title": "Voyager",
    "landing.step3Desc":
      "Recevez votre confirmation, retrouvez votre chauffeur à l'aéroport et profitez d'un transfert confortable.",
    "landing.happyTravelers": "Voyageurs satisfaits",
    "landing.onTimeRate": "Taux de ponctualité",
    "landing.customerSupport": "Service client",
    "landing.averageRating": "Note moyenne",
    "landing.guestsSay": "Ce que disent nos clients",
    "landing.theDifference": "La différence",
    "landing.noHiddenFees":
      "Aucun frais caché — tarification transparente",
    "landing.freeCancellation":
      "Annulation gratuite jusqu'à 24 heures avant",
    "landing.flightTracking":
      "Suivi des vols en temps réel pour les arrivées",
    "landing.proDrivers":
      "Chauffeurs professionnels anglophones",
    "landing.modernVehicles": "Véhicules modernes et climatisés",
    "landing.doorToDoor":
      "Service porte-à-porte dans toute l'Égypte",
    "landing.readyToBook": "Prêt à réserver votre transfert ?",
    "landing.instantQuote":
      "Obtenez un devis instantané et réservez en moins de 2 minutes",

    // Track Booking
    "track.title": "Suivre votre réservation",
    "track.enterRef":
      "Entrez votre référence de réservation pour vérifier le statut de votre transfert.",
    "track.reference": "Référence de réservation",
    "track.placeholder": "ex. GB-240101-0001",
    "track.search": "Suivre",
    "track.notFound": "Réservation introuvable. Veuillez vérifier la référence et réessayer.",
    "track.bookingDetails": "Détails de la réservation",
    "track.tripInfo": "Informations sur le trajet",
    "track.guestInfo": "Informations sur le passager",
    "track.flightDetails": "Détails du vol",
    "track.payment": "Paiement",
    "track.service": "Service",
    "track.date": "Date",
    "track.pickupTime": "Heure de prise en charge",
    "track.passengers": "Passagers",
    "track.from": "De",
    "track.to": "À",
    "track.hotel": "Hôtel",
    "track.vehicle": "Véhicule",
    "track.name": "Nom",
    "track.email": "E-mail",
    "track.phone": "Téléphone",
    "track.country": "Pays",
    "track.flight": "Vol",
    "track.airline": "Compagnie aérienne",
    "track.terminal": "Terminal",
    "track.method": "Mode de paiement",
    "track.status": "Statut",
    "track.total": "Total",
    "track.notes": "Notes",
    "track.payOnArrival": "Paiement à l'arrivée",
    "track.onlinePayment": "Paiement en ligne",
    "track.cancelBooking": "Annuler la réservation",
    "track.bookingConfirmed": "Votre réservation a été confirmée et un chauffeur sera assigné. Les coordonnées du chauffeur vous seront envoyées par e-mail avant l'heure de prise en charge.",
    "track.bookingCancelled": "Cette réservation a été annulée.",
    "track.enterRefAbove": "Entrez votre référence de réservation ci-dessus pour consulter les détails de votre réservation.",
    "track.statusPending": "En attente",
    "track.statusConfirmed": "Confirmée",
    "track.statusAssigned": "Chauffeur assigné",
    "track.statusCompleted": "Terminée",
    "track.statusCancelled": "Annulée",
    "track.statusConverted": "Convertie en mission",

    // Footer
    "footer.quickLinks": "Liens rapides",
    "footer.contactUs": "Nous contacter",
    "footer.stayConnected": "Restez connecté",
    "footer.followUs":
      "Suivez-nous sur les réseaux sociaux pour des actualités, des conseils de voyage et des offres spéciales.",
    "footer.rights": "Tous droits réservés.",
    "footer.about":
      "Services professionnels de transfert aéroport et de transport dans toute l'Égypte.",

    // Features
    "features.subtitle": "Approuvé chaque année par des milliers de voyageurs pour des transferts fiables et confortables",
    "features.supportTitle": "Support client 24h/24 et 7j/7",
    "features.supportDesc": "Notre équipe d'assistance dédiée est disponible à tout moment pour vous aider avec vos questions ou modifications de réservation.",
    "features.meetGreetTitle": "Service d'accueil personnalisé",
    "features.meetGreetDesc": "Votre chauffeur vous attendra aux arrivées avec une pancarte à votre nom, vous aidera avec vos bagages et vous escortera jusqu'au véhicule.",
    "features.driversTitle": "Chauffeurs professionnels",
    "features.driversDesc": "Des chauffeurs agréés, expérimentés et vérifiés avec des véhicules modernes et bien entretenus pour un trajet sûr et confortable.",
    "features.flightTitle": "Suivi des vols",
    "features.flightDesc": "Nous suivons votre vol en temps réel et ajustons automatiquement les horaires de prise en charge en cas de retard ou d'arrivée anticipée.",
    "features.noFeesTitle": "Aucun frais caché",
    "features.noFeesDesc": "Le prix affiché est le prix que vous payez. Pas de tarification dynamique, pas de frais imprévus, et annulation gratuite jusqu'à 24h avant.",
    "features.paymentTitle": "Paiement sécurisé",
    "features.paymentDesc": "Payez en ligne en toute sécurité ou choisissez de payer votre chauffeur à l'arrivée. Toutes les transactions sont cryptées et protégées.",

    // Testimonials
    "testimonial.1.quote": "Un service excellent du début à la fin. Le chauffeur nous attendait aux arrivées et le véhicule était impeccable.",
    "testimonial.1.name": "Sarah M.",
    "testimonial.1.location": "Londres, Royaume-Uni",
    "testimonial.2.quote": "Nous avons réservé une excursion d'une journée aux Pyramides. Le chauffeur était sympathique, compétent et a rendu notre voyage inoubliable.",
    "testimonial.2.name": "Marco R.",
    "testimonial.2.location": "Rome, Italie",
    "testimonial.3.quote": "Très professionnel. Notre vol avait 2 heures de retard mais ils l'ont suivi et le chauffeur était toujours là. Je recommande vivement !",
    "testimonial.3.name": "James K.",
    "testimonial.3.location": "Sydney, Australie",

    // Admin-configured site content
    "site.heroTitle": "Réservez votre transfert aéroport",
    "site.heroSubtitle": "Des transferts privés sûrs, confortables et fiables dans toute l'Égypte. De l'aéroport à votre hôtel, nous vous couvrons.",
    "site.featuresTitle": "Pourquoi nous choisir ?",

    // Booking widget sub-components
    "booking.pickDate": "Choisir une date",
    "booking.pickTime": "Choisir l'heure",
    "booking.searchPlaceholder": "Rechercher…",
    "booking.noDestinations": "Aucune destination trouvée pour cet aéroport.",
    "booking.hourMinute": "Heure · Minute",
    // Destination landing pages
    "destination.heroDesc": "Transferts privés à prix fixe depuis {airport} ({iata}) jusqu'à votre hôtel — suivi de vol, annulation gratuite et assistance 24h/24.",
    "destination.popularRoutes": "Trajets populaires à {city}",
    "destination.fixedPrice": "Prix fixe — aucun frais caché",
    "destination.freeCancellation": "Annulation gratuite jusqu'à 24h",
    "destination.flightTracking": "Suivi des vols en temps réel",
    "destination.ctaTitle": "Réservez votre transfert à l'aéroport de {city}",
    "destination.ctaDesc": "Prix instantané, réservation sécurisée et un chauffeur à votre arrivée.",
    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Transferts aéroport privés · Égypte",
    "landing.airportCoverage": "Aéroports desservis en Égypte",
    "landing.airportCoverageDesc": "Transferts privés à l'arrivée et au départ de tous les grands aéroports égyptiens, directement à votre hôtel ou resort.",
    "landing.faq": "Questions fréquemment posées",
    "booking.search": "Rechercher",
    "booking.anywhereIn": "N'importe où à",
    "faq.q1": "Comment réserver un transfert aéroport en Égypte ?",
    "faq.a1": "Saisissez votre aéroport de départ, votre destination, la date et le nombre de passagers sur notre page d'accueil. Vous recevrez un prix instantané. Réservez et payez en ligne en toute sécurité, ou choisissez de payer à l'arrivée.",
    "faq.q2": "Que se passe-t-il si mon vol est retardé ?",
    "faq.a2": "Nous suivons tous les vols en temps réel. En cas de retard, nous ajustons automatiquement l'heure de prise en charge de votre chauffeur sans frais supplémentaires.",
    "faq.q3": "Puis-je annuler mon transfert ?",
    "faq.a3": "Oui. L'annulation gratuite est possible jusqu'à 24 heures avant votre transfert prévu.",
    "faq.q4": "Quels aéroports d'Égypte couvrez-vous ?",
    "faq.a4": "Nous couvrons tous les grands aéroports égyptiens : Hurghada (HRG), Le Caire (CAI), Charm el-Cheikh (SSH), Louxor (LXR), Assouan (ASW), Marsa Alam (RMF) et Alexandrie (HBE).",
    "faq.q5": "Y a-t-il des frais cachés ?",
    "faq.a5": "Non. Le prix indiqué lors de la réservation est le prix que vous payez. Pas de tarification dynamique, pas de suppléments aéroport, pas de frais cachés.",

    // Common
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.bookAnother": "Réserver un autre transfert",
    "common.step": "Étape",

    // Contact form
    "contact.name": "Nom",
    "contact.email": "E-mail",
    "contact.phone": "Téléphone (facultatif)",
    "contact.subject": "Objet (facultatif)",
    "contact.message": "Message",
    "contact.send": "Envoyer le message",
    "contact.sending": "Envoi en cours…",
    "contact.success": "Merci — nous vous répondrons sous peu.",
    "contact.errorGeneric": "Une erreur est survenue. Veuillez réessayer.",
    "contact.errorTooMany": "Veuillez patienter un moment et réessayer.",
    "contact.errorCaptcha": "La vérification du captcha a échoué. Veuillez réessayer.",
    "contact.required": "Ce champ est obligatoire.",
    "contact.invalidEmail": "Veuillez saisir une adresse e-mail valide.",
    "contact.namePlaceholder": "Votre nom complet",
    "contact.emailPlaceholder": "votre@email.fr",
    "contact.phonePlaceholder": "+33 6 12 34 56 78",
    "contact.subjectPlaceholder": "De quoi s'agit-il ?",
    "contact.messagePlaceholder": "Votre message…",

    // Cookie consent
    "cookie.title": "Nous utilisons des cookies",
    "cookie.body": "Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic du site et afficher du contenu pertinent. Vous pouvez tout accepter, refuser les cookies non essentiels ou choisir les types à autoriser.",
    "cookie.accept": "Tout accepter",
    "cookie.reject": "Tout refuser",
    "cookie.manage": "Gérer",
    "cookie.manageTitle": "Préférences de cookies",
    "cookie.essential": "Essentiels",
    "cookie.essentialDesc": "Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.",
    "cookie.analytics": "Analytiques",
    "cookie.analyticsDesc": "Nous aident à comprendre comment les visiteurs utilisent le site.",
    "cookie.marketing": "Marketing",
    "cookie.marketingDesc": "Utilisés pour vous montrer des publicités et offres pertinentes.",
    "cookie.save": "Enregistrer les préférences",
  },

  /* ============================  ITALIAN  ============================ */
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.bookNow": "Prenota ora",
    "nav.trackBooking": "Traccia prenotazione",
    "nav.myAccount": "Il mio account",
    "nav.menu": "Menu",

    // Booking Widget
    "booking.arrivalTransfer": "Transfer di arrivo",
    "booking.departureTransfer": "Transfer di partenza",
    "booking.arrivalAirport": "Aeroporto di arrivo",
    "booking.departureAirport": "Aeroporto di partenza",
    "booking.selectAirport": "Seleziona aeroporto",
    "booking.date": "Data",
    "booking.time": "Ora",
    "booking.passengers": "Passeggeri",
    "booking.luggage": "Bagagli",
    "booking.pickupAirport": "Ritiro (zona aeroporto)",
    "booking.pickupHotel": "Ritiro (hotel / indirizzo)",
    "booking.dropoffHotel": "Consegna (hotel / indirizzo)",
    "booking.dropoffAirport": "Consegna (zona aeroporto)",
    "booking.searchLocation": "Cerca località...",
    "booking.babySeat": "Seggiolino neonato",
    "booking.boosterSeat": "Rialzo per bambini",
    "booking.wheelchair": "Sedia a rotelle",
    "booking.getQuote": "Ottieni un preventivo istantaneo",
    "booking.gettingQuote": "Preventivo in corso...",
    "booking.yourPrice": "Il tuo prezzo",
    "booking.bookNow": "Prenota ora",

    // Landing Page
    "landing.howItWorks": "Come funziona",
    "landing.threeSteps":
      "Prenota il tuo transfer in tre semplici passaggi",
    "landing.step1Title": "Cerca",
    "landing.step1Desc":
      "Inserisci i dettagli del viaggio — ritiro, destinazione, data e passeggeri — per ottenere un preventivo istantaneo.",
    "landing.step2Title": "Prenota e paga",
    "landing.step2Desc":
      "Compila i tuoi dati, scegli gli extra se necessario e paga in sicurezza online o all'arrivo.",
    "landing.step3Title": "Viaggia",
    "landing.step3Desc":
      "Ricevi la conferma, incontra il tuo autista in aeroporto e goditi un transfer comodo e piacevole.",
    "landing.happyTravelers": "Viaggiatori soddisfatti",
    "landing.onTimeRate": "Tasso di puntualità",
    "landing.customerSupport": "Assistenza clienti",
    "landing.averageRating": "Valutazione media",
    "landing.guestsSay": "Cosa dicono i nostri ospiti",
    "landing.theDifference": "La differenza",
    "landing.noHiddenFees":
      "Nessun costo nascosto — prezzi trasparenti",
    "landing.freeCancellation":
      "Cancellazione gratuita fino a 24 ore prima",
    "landing.flightTracking":
      "Tracciamento voli in tempo reale per gli arrivi",
    "landing.proDrivers":
      "Autisti professionisti che parlano inglese",
    "landing.modernVehicles": "Veicoli moderni e climatizzati",
    "landing.doorToDoor":
      "Servizio porta a porta in tutto l'Egitto",
    "landing.readyToBook": "Pronto a prenotare il tuo transfer?",
    "landing.instantQuote":
      "Ottieni un preventivo istantaneo e prenota in meno di 2 minuti",

    // Track Booking
    "track.title": "Traccia la tua prenotazione",
    "track.enterRef":
      "Inserisci il riferimento della prenotazione per verificare lo stato del tuo transfer.",
    "track.reference": "Riferimento prenotazione",
    "track.placeholder": "es. GB-240101-0001",
    "track.search": "Traccia",
    "track.notFound": "Prenotazione non trovata. Verifica il riferimento e riprova.",
    "track.bookingDetails": "Dettagli della prenotazione",
    "track.tripInfo": "Informazioni sul viaggio",
    "track.guestInfo": "Informazioni sull'ospite",
    "track.flightDetails": "Dettagli del volo",
    "track.payment": "Pagamento",
    "track.service": "Servizio",
    "track.date": "Data",
    "track.pickupTime": "Orario di ritiro",
    "track.passengers": "Passeggeri",
    "track.from": "Da",
    "track.to": "A",
    "track.hotel": "Hotel",
    "track.vehicle": "Veicolo",
    "track.name": "Nome",
    "track.email": "E-mail",
    "track.phone": "Telefono",
    "track.country": "Paese",
    "track.flight": "Volo",
    "track.airline": "Compagnia aerea",
    "track.terminal": "Terminal",
    "track.method": "Metodo di pagamento",
    "track.status": "Stato",
    "track.total": "Totale",
    "track.notes": "Note",
    "track.payOnArrival": "Pagamento all'arrivo",
    "track.onlinePayment": "Pagamento online",
    "track.cancelBooking": "Annulla prenotazione",
    "track.bookingConfirmed": "La tua prenotazione è stata confermata e verrà assegnato un autista. I dettagli dell'autista saranno condivisi via e-mail prima dell'orario di ritiro.",
    "track.bookingCancelled": "Questa prenotazione è stata annullata.",
    "track.enterRefAbove": "Inserisci il riferimento della prenotazione qui sopra per visualizzare i dettagli.",
    "track.statusPending": "In attesa",
    "track.statusConfirmed": "Confermata",
    "track.statusAssigned": "Autista assegnato",
    "track.statusCompleted": "Completata",
    "track.statusCancelled": "Annullata",
    "track.statusConverted": "Convertita in incarico",

    // Footer
    "footer.quickLinks": "Link rapidi",
    "footer.contactUs": "Contattaci",
    "footer.stayConnected": "Resta connesso",
    "footer.followUs":
      "Seguici sui social media per aggiornamenti, consigli di viaggio e offerte speciali.",
    "footer.rights": "Tutti i diritti riservati.",
    "footer.about":
      "Servizi professionali di transfer aeroportuale e trasporto in tutto l'Egitto.",

    // Features
    "features.subtitle": "Scelto ogni anno da migliaia di viaggiatori per trasferimenti affidabili e confortevoli",
    "features.supportTitle": "Assistenza clienti 24/7",
    "features.supportDesc": "Il nostro team di supporto dedicato è disponibile in qualsiasi momento per assisterti con domande o modifiche alla prenotazione.",
    "features.meetGreetTitle": "Servizio Meet & Greet",
    "features.meetGreetDesc": "Il tuo autista ti aspetterà agli arrivi con un cartello con il tuo nome, ti aiuterà con i bagagli e ti accompagnerà al veicolo.",
    "features.driversTitle": "Autisti professionisti",
    "features.driversDesc": "Autisti autorizzati, esperti e verificati con veicoli moderni e ben mantenuti per un viaggio sicuro e confortevole.",
    "features.flightTitle": "Monitoraggio voli",
    "features.flightDesc": "Monitoriamo il tuo volo in tempo reale e regoliamo automaticamente gli orari di ritiro in caso di ritardi o arrivi anticipati.",
    "features.noFeesTitle": "Nessun costo nascosto",
    "features.noFeesDesc": "Il prezzo che vedi è il prezzo che paghi. Nessun sovrapprezzo, nessun costo imprevisto e cancellazione gratuita fino a 24 ore prima.",
    "features.paymentTitle": "Pagamento sicuro",
    "features.paymentDesc": "Paga in sicurezza online o scegli di pagare l'autista all'arrivo. Tutte le transazioni sono crittografate e protette.",

    // Testimonials
    "testimonial.1.quote": "Servizio eccellente dall'inizio alla fine. L'autista ci aspettava agli arrivi e il veicolo era impeccabile.",
    "testimonial.1.name": "Sarah M.",
    "testimonial.1.location": "Londra, Regno Unito",
    "testimonial.2.quote": "Abbiamo prenotato un tour giornaliero alle Piramidi. L'autista era cordiale, competente e ha reso il nostro viaggio indimenticabile.",
    "testimonial.2.name": "Marco R.",
    "testimonial.2.location": "Roma, Italia",
    "testimonial.3.quote": "Molto professionale. Il nostro volo era in ritardo di 2 ore ma l'hanno monitorato e l'autista era ancora lì. Altamente raccomandato!",
    "testimonial.3.name": "James K.",
    "testimonial.3.location": "Sydney, Australia",

    // Admin-configured site content
    "site.heroTitle": "Prenota il tuo transfer aeroportuale",
    "site.heroSubtitle": "Transfer privati sicuri, confortevoli e affidabili in tutta l'Egitto. Dall'aeroporto al tuo hotel, ci pensiamo noi.",
    "site.featuresTitle": "Perché sceglierci?",

    // Booking widget sub-components
    "booking.pickDate": "Scegli data",
    "booking.pickTime": "Scegli orario",
    "booking.searchPlaceholder": "Cerca…",
    "booking.noDestinations": "Nessuna destinazione trovata per questo aeroporto.",
    "booking.hourMinute": "Ora · Minuto",
    // Destination landing pages
    "destination.heroDesc": "Transfer privati a prezzo fisso da {airport} ({iata}) al tuo hotel — monitoraggio voli, cancellazione gratuita e supporto 24/7.",
    "destination.popularRoutes": "Percorsi popolari a {city}",
    "destination.fixedPrice": "Prezzo fisso — nessun costo nascosto",
    "destination.freeCancellation": "Cancellazione gratuita fino a 24h",
    "destination.flightTracking": "Monitoraggio voli in tempo reale",
    "destination.ctaTitle": "Prenota il tuo transfer all'aeroporto di {city}",
    "destination.ctaDesc": "Prezzo istantaneo, prenotazione sicura e un autista ad aspettarti all'arrivo.",
    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Transfer aeroportuali privati · Egitto",
    "landing.airportCoverage": "Aeroporti coperti in Egitto",
    "landing.airportCoverageDesc": "Transfer privati all'arrivo e alla partenza da tutti i principali aeroporti egiziani, direttamente al tuo hotel o resort.",
    "landing.faq": "Domande frequenti",
    "booking.search": "Cerca",
    "booking.anywhereIn": "Ovunque a",
    "faq.q1": "Come prenotare un transfer aeroportuale in Egitto?",
    "faq.a1": "Inserisci l'aeroporto di partenza, la destinazione, la data e il numero di passeggeri nella nostra homepage. Riceverai un prezzo istantaneo. Prenota e paga online in sicurezza, oppure scegli di pagare all'arrivo.",
    "faq.q2": "Cosa succede se il mio volo è in ritardo?",
    "faq.a2": "Monitoriamo tutti i voli in tempo reale. In caso di ritardo, adeguiamo automaticamente l'orario di ritiro del tuo autista senza costi aggiuntivi.",
    "faq.q3": "Posso cancellare il mio transfer?",
    "faq.a3": "Sì. La cancellazione gratuita è disponibile fino a 24 ore prima del transfer prenotato.",
    "faq.q4": "Quali aeroporti in Egitto coprite?",
    "faq.a4": "Copriamo tutti i principali aeroporti egiziani: Hurghada (HRG), Il Cairo (CAI), Sharm el-Sheikh (SSH), Luxor (LXR), Assuan (ASW), Marsa Alam (RMF) e Alessandria (HBE).",
    "faq.q5": "Ci sono costi nascosti?",
    "faq.a5": "No. Il prezzo indicato alla prenotazione è il prezzo che paghi. Nessun sovrapprezzo, nessun supplemento aeroportuale, nessun costo nascosto.",

    // Common
    "common.loading": "Caricamento...",
    "common.error": "Qualcosa è andato storto",
    "common.bookAnother": "Prenota un altro transfer",
    "common.step": "Passo",

    // Contact form
    "contact.name": "Nome",
    "contact.email": "Email",
    "contact.phone": "Telefono (opzionale)",
    "contact.subject": "Oggetto (opzionale)",
    "contact.message": "Messaggio",
    "contact.send": "Invia messaggio",
    "contact.sending": "Invio in corso…",
    "contact.success": "Grazie — ti risponderemo a breve.",
    "contact.errorGeneric": "Qualcosa è andato storto. Riprova.",
    "contact.errorTooMany": "Attendi un momento e riprova.",
    "contact.errorCaptcha": "Verifica captcha fallita. Riprova.",
    "contact.required": "Questo campo è obbligatorio.",
    "contact.invalidEmail": "Inserisci un indirizzo email valido.",
    "contact.namePlaceholder": "Il tuo nome completo",
    "contact.emailPlaceholder": "tua@email.it",
    "contact.phonePlaceholder": "+39 333 123 4567",
    "contact.subjectPlaceholder": "Di cosa si tratta?",
    "contact.messagePlaceholder": "Il tuo messaggio…",

    // Cookie consent
    "cookie.title": "Utilizziamo i cookie",
    "cookie.body": "Utilizziamo i cookie per migliorare la tua esperienza, analizzare il traffico del sito e mostrare contenuti pertinenti. Puoi accettare tutti, rifiutare quelli non essenziali o scegliere quali tipi consentire.",
    "cookie.accept": "Accetta tutti",
    "cookie.reject": "Rifiuta tutti",
    "cookie.manage": "Gestisci",
    "cookie.manageTitle": "Preferenze cookie",
    "cookie.essential": "Essenziali",
    "cookie.essentialDesc": "Necessari per il funzionamento del sito. Non possono essere disabilitati.",
    "cookie.analytics": "Analitici",
    "cookie.analyticsDesc": "Ci aiutano a capire come i visitatori usano il sito.",
    "cookie.marketing": "Marketing",
    "cookie.marketingDesc": "Usati per mostrarti annunci e offerte pertinenti.",
    "cookie.save": "Salva preferenze",
  },

  /* ============================  DUTCH  ============================== */
  nl: {
    // Navigation
    "nav.home": "Home",
    "nav.bookNow": "Nu boeken",
    "nav.trackBooking": "Boeking volgen",
    "nav.myAccount": "Mijn account",
    "nav.menu": "Menu",

    // Booking Widget
    "booking.arrivalTransfer": "Aankomsttransfer",
    "booking.departureTransfer": "Vertrektransfer",
    "booking.arrivalAirport": "Aankomstluchthaven",
    "booking.departureAirport": "Vertrekluchthaven",
    "booking.selectAirport": "Luchthaven selecteren",
    "booking.date": "Datum",
    "booking.time": "Tijd",
    "booking.passengers": "Passagiers",
    "booking.luggage": "Bagage",
    "booking.pickupAirport": "Ophalen (luchthavengebied)",
    "booking.pickupHotel": "Ophalen (hotel / adres)",
    "booking.dropoffHotel": "Afzetten (hotel / adres)",
    "booking.dropoffAirport": "Afzetten (luchthavengebied)",
    "booking.searchLocation": "Locatie zoeken...",
    "booking.babySeat": "Babyzitje",
    "booking.boosterSeat": "Kinderzitverhoger",
    "booking.wheelchair": "Rolstoel",
    "booking.getQuote": "Direct offerte ontvangen",
    "booking.gettingQuote": "Offerte wordt opgehaald...",
    "booking.yourPrice": "Uw prijs",
    "booking.bookNow": "Nu boeken",

    // Landing Page
    "landing.howItWorks": "Hoe het werkt",
    "landing.threeSteps":
      "Boek uw transfer in drie eenvoudige stappen",
    "landing.step1Title": "Zoeken",
    "landing.step1Desc":
      "Voer uw reisgegevens in — ophaaladres, bestemming, datum en aantal passagiers — en ontvang direct een prijsopgave.",
    "landing.step2Title": "Boeken en betalen",
    "landing.step2Desc":
      "Vul uw gegevens in, kies eventueel extra's en betaal veilig online of bij aankomst.",
    "landing.step3Title": "Reizen",
    "landing.step3Desc":
      "Ontvang uw bevestiging, ontmoet uw chauffeur op de luchthaven en geniet van een comfortabele transfer.",
    "landing.happyTravelers": "Tevreden reizigers",
    "landing.onTimeRate": "Stiptheidspercentage",
    "landing.customerSupport": "Klantenservice",
    "landing.averageRating": "Gemiddelde beoordeling",
    "landing.guestsSay": "Wat onze gasten zeggen",
    "landing.theDifference": "Het verschil",
    "landing.noHiddenFees":
      "Geen verborgen kosten — transparante prijzen",
    "landing.freeCancellation":
      "Gratis annulering tot 24 uur van tevoren",
    "landing.flightTracking":
      "Realtime vluchten volgen bij aankomst",
    "landing.proDrivers":
      "Professionele, Engelssprekende chauffeurs",
    "landing.modernVehicles":
      "Moderne voertuigen met airconditioning",
    "landing.doorToDoor":
      "Deur-tot-deurservice door heel Egypte",
    "landing.readyToBook": "Klaar om uw transfer te boeken?",
    "landing.instantQuote":
      "Ontvang direct een offerte en boek in minder dan 2 minuten",

    // Track Booking
    "track.title": "Uw boeking volgen",
    "track.enterRef":
      "Voer uw boekingsreferentie in om de status van uw transfer te controleren.",
    "track.reference": "Boekingsreferentie",
    "track.placeholder": "bijv. GB-240101-0001",
    "track.search": "Volgen",
    "track.notFound": "Boeking niet gevonden. Controleer de referentie en probeer het opnieuw.",
    "track.bookingDetails": "Boekingsgegevens",
    "track.tripInfo": "Reisinformatie",
    "track.guestInfo": "Gastgegevens",
    "track.flightDetails": "Vluchtgegevens",
    "track.payment": "Betaling",
    "track.service": "Service",
    "track.date": "Datum",
    "track.pickupTime": "Ophaaltijd",
    "track.passengers": "Passagiers",
    "track.from": "Van",
    "track.to": "Naar",
    "track.hotel": "Hotel",
    "track.vehicle": "Voertuig",
    "track.name": "Naam",
    "track.email": "E-mail",
    "track.phone": "Telefoon",
    "track.country": "Land",
    "track.flight": "Vlucht",
    "track.airline": "Luchtvaartmaatschappij",
    "track.terminal": "Terminal",
    "track.method": "Betaalmethode",
    "track.status": "Status",
    "track.total": "Totaal",
    "track.notes": "Opmerkingen",
    "track.payOnArrival": "Betaling bij aankomst",
    "track.onlinePayment": "Online betaling",
    "track.cancelBooking": "Boeking annuleren",
    "track.bookingConfirmed": "Uw boeking is bevestigd en er wordt een chauffeur toegewezen. De chauffeurgegevens worden vóór de ophaaltijd per e-mail gedeeld.",
    "track.bookingCancelled": "Deze boeking is geannuleerd.",
    "track.enterRefAbove": "Voer hierboven uw boekingsreferentie in om uw boekingsgegevens te bekijken.",
    "track.statusPending": "In afwachting",
    "track.statusConfirmed": "Bevestigd",
    "track.statusAssigned": "Chauffeur toegewezen",
    "track.statusCompleted": "Voltooid",
    "track.statusCancelled": "Geannuleerd",
    "track.statusConverted": "Omgezet naar opdracht",

    // Footer
    "footer.quickLinks": "Snelkoppelingen",
    "footer.contactUs": "Contact",
    "footer.stayConnected": "Blijf verbonden",
    "footer.followUs":
      "Volg ons op sociale media voor updates, reistips en speciale aanbiedingen.",
    "footer.rights": "Alle rechten voorbehouden.",
    "footer.about":
      "Professionele luchthaven­transfer- en vervoersdiensten door heel Egypte.",

    // Features
    "features.subtitle": "Jaarlijks vertrouwd door duizenden reizigers voor betrouwbare, comfortabele transfers",
    "features.supportTitle": "24/7 Klantenservice",
    "features.supportDesc": "Ons toegewijde supportteam staat dag en nacht klaar om u te helpen met vragen of wijzigingen aan uw boeking.",
    "features.meetGreetTitle": "Meet & Greet Service",
    "features.meetGreetDesc": "Uw chauffeur staat u op te wachten bij de aankomsthal met een naambordje, helpt met bagage en begeleidt u naar het voertuig.",
    "features.driversTitle": "Professionele chauffeurs",
    "features.driversDesc": "Gecertificeerde, ervaren en geverifieerde chauffeurs met moderne, goed onderhouden voertuigen voor een veilige en comfortabele rit.",
    "features.flightTitle": "Vluchten volgen",
    "features.flightDesc": "We volgen uw vlucht in realtime en passen de ophaaltijden automatisch aan bij vertragingen of vroege aankomsten.",
    "features.noFeesTitle": "Geen verborgen kosten",
    "features.noFeesDesc": "De prijs die u ziet, is de prijs die u betaalt. Geen extra toeslagen, geen onverwachte kosten en gratis annulering tot 24 uur van tevoren.",
    "features.paymentTitle": "Veilig betalen",
    "features.paymentDesc": "Betaal veilig online of kies ervoor om uw chauffeur bij aankomst te betalen. Alle transacties zijn versleuteld en beschermd.",

    // Testimonials
    "testimonial.1.quote": "Uitstekende service van begin tot eind. De chauffeur stond ons op te wachten bij de aankomst en het voertuig was onberispelijk.",
    "testimonial.1.name": "Sarah M.",
    "testimonial.1.location": "Londen, VK",
    "testimonial.2.quote": "We hebben een dagtour naar de Piramides geboekt. De chauffeur was vriendelijk, deskundig en maakte onze reis onvergetelijk.",
    "testimonial.2.name": "Marco R.",
    "testimonial.2.location": "Rome, Italië",
    "testimonial.3.quote": "Zeer professioneel. Onze vlucht had 2 uur vertraging maar ze volgden het en de chauffeur was er nog steeds. Sterk aanbevolen!",
    "testimonial.3.name": "James K.",
    "testimonial.3.location": "Sydney, Australië",

    // Admin-configured site content
    "site.heroTitle": "Boek uw luchthaventransfer",
    "site.heroSubtitle": "Veilige, comfortabele en betrouwbare privétransfers door heel Egypte. Van het vliegveld naar uw hotel.",
    "site.featuresTitle": "Waarom ons kiezen?",

    // Booking widget sub-components
    "booking.pickDate": "Kies datum",
    "booking.pickTime": "Kies tijd",
    "booking.searchPlaceholder": "Zoeken…",
    "booking.noDestinations": "Geen bestemmingen gevonden voor deze luchthaven.",
    "booking.hourMinute": "Uur · Minuut",
    // Destination landing pages
    "destination.heroDesc": "Privétransfers tegen vaste prijs vanaf {airport} ({iata}) naar uw hotel — vluchten volgen, gratis annulering en 24/7 ondersteuning.",
    "destination.popularRoutes": "Populaire transferroutes in {city}",
    "destination.fixedPrice": "Vaste prijs — geen verborgen kosten",
    "destination.freeCancellation": "Gratis annulering tot 24u",
    "destination.flightTracking": "Realtime vluchten volgen",
    "destination.ctaTitle": "Boek uw luchthaventransfer in {city}",
    "destination.ctaDesc": "Directe prijs, veilige boeking en een chauffeur die op u wacht bij aankomst.",
    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Privé luchthavnetransfers · Egypte",
    "landing.airportCoverage": "Luchthavens in Egypte",
    "landing.airportCoverageDesc": "Privétransfers bij aankomst en vertrek van alle grote Egyptische luchthavens, direct naar uw hotel of resort.",
    "landing.faq": "Veelgestelde vragen",
    "booking.search": "Zoeken",
    "booking.anywhereIn": "Overal in",
    "faq.q1": "Hoe boek ik een luchthaventransfer in Egypte?",
    "faq.a1": "Voer op onze homepage uw ophaalvliegveld, bestemming, datum en aantal passagiers in. U ontvangt direct een prijs. Boek en betaal veilig online, of kies om bij aankomst te betalen.",
    "faq.q2": "Wat gebeurt er als mijn vlucht vertraging heeft?",
    "faq.a2": "Wij volgen alle vluchten in realtime. Bij vertraging passen we automatisch de ophaaltijd van uw chauffeur aan, zonder extra kosten.",
    "faq.q3": "Kan ik mijn transfer annuleren?",
    "faq.a3": "Ja. Gratis annulering is mogelijk tot 24 uur voor uw geplande transfer.",
    "faq.q4": "Welke luchthavens in Egypte dekt u af?",
    "faq.a4": "Wij bedienen alle grote Egyptische luchthavens: Hurghada (HRG), Caïro (CAI), Sharm el-Sheikh (SSH), Luxor (LXR), Aswan (ASW), Marsa Alam (RMF) en Alexandrië (HBE).",
    "faq.q5": "Zijn er verborgen kosten?",
    "faq.a5": "Nee. De prijs die u bij boeking ziet, is de prijs die u betaalt. Geen toeslagen, geen luchthavenheffingen, geen verborgen extra's.",

    // Common
    "common.loading": "Laden...",
    "common.error": "Er is iets misgegaan",
    "common.bookAnother": "Nog een transfer boeken",
    "common.step": "Stap",

    // Contact form
    "contact.name": "Naam",
    "contact.email": "E-mail",
    "contact.phone": "Telefoon (optioneel)",
    "contact.subject": "Onderwerp (optioneel)",
    "contact.message": "Bericht",
    "contact.send": "Bericht verzenden",
    "contact.sending": "Verzenden…",
    "contact.success": "Bedankt — we nemen snel contact met u op.",
    "contact.errorGeneric": "Er is iets misgegaan. Probeer het opnieuw.",
    "contact.errorTooMany": "Wacht even en probeer het opnieuw.",
    "contact.errorCaptcha": "Captcha-verificatie mislukt. Probeer het opnieuw.",
    "contact.required": "Dit veld is verplicht.",
    "contact.invalidEmail": "Voer een geldig e-mailadres in.",
    "contact.namePlaceholder": "Uw volledige naam",
    "contact.emailPlaceholder": "uw@email.nl",
    "contact.phonePlaceholder": "+31 6 12345678",
    "contact.subjectPlaceholder": "Waar gaat het over?",
    "contact.messagePlaceholder": "Uw bericht…",

    // Cookie consent
    "cookie.title": "Wij gebruiken cookies",
    "cookie.body": "Wij gebruiken cookies om uw ervaring te verbeteren, siteverkeer te analyseren en relevante inhoud te tonen. U kunt alles accepteren, niet-essentiële cookies weigeren of kiezen welke typen u wilt toestaan.",
    "cookie.accept": "Alles accepteren",
    "cookie.reject": "Alles weigeren",
    "cookie.manage": "Beheren",
    "cookie.manageTitle": "Cookievoorkeuren",
    "cookie.essential": "Noodzakelijk",
    "cookie.essentialDesc": "Vereist voor het functioneren van de site. Kan niet worden uitgeschakeld.",
    "cookie.analytics": "Analytisch",
    "cookie.analyticsDesc": "Helpen ons te begrijpen hoe bezoekers de site gebruiken.",
    "cookie.marketing": "Marketing",
    "cookie.marketingDesc": "Worden gebruikt om u relevante advertenties en aanbiedingen te tonen.",
    "cookie.save": "Voorkeuren opslaan",
  },

  /* ============================  RUSSIAN  ============================ */
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.bookNow": "Забронировать",
    "nav.trackBooking": "Отследить бронирование",
    "nav.myAccount": "Мой аккаунт",
    "nav.menu": "Меню",

    // Booking Widget
    "booking.arrivalTransfer": "Трансфер по прибытии",
    "booking.departureTransfer": "Трансфер при отъезде",
    "booking.arrivalAirport": "Аэропорт прибытия",
    "booking.departureAirport": "Аэропорт вылета",
    "booking.selectAirport": "Выберите аэропорт",
    "booking.date": "Дата",
    "booking.time": "Время",
    "booking.passengers": "Пассажиры",
    "booking.luggage": "Багаж",
    "booking.pickupAirport": "Посадка (зона аэропорта)",
    "booking.pickupHotel": "Посадка (отель / адрес)",
    "booking.dropoffHotel": "Высадка (отель / адрес)",
    "booking.dropoffAirport": "Высадка (зона аэропорта)",
    "booking.searchLocation": "Поиск места...",
    "booking.babySeat": "Детское автокресло",
    "booking.boosterSeat": "Бустер для ребёнка",
    "booking.wheelchair": "Инвалидная коляска",
    "booking.getQuote": "Получить мгновенную цену",
    "booking.gettingQuote": "Расчёт стоимости...",
    "booking.yourPrice": "Ваша цена",
    "booking.bookNow": "Забронировать",

    // Landing Page
    "landing.howItWorks": "Как это работает",
    "landing.threeSteps":
      "Закажите трансфер в три простых шага",
    "landing.step1Title": "Поиск",
    "landing.step1Desc":
      "Введите данные поездки — место посадки, высадки, дату и количество пассажиров — и мгновенно получите стоимость.",
    "landing.step2Title": "Бронирование и оплата",
    "landing.step2Desc":
      "Заполните данные, выберите дополнительные услуги при необходимости и оплатите онлайн или по прибытии.",
    "landing.step3Title": "Поездка",
    "landing.step3Desc":
      "Получите подтверждение, встретьте водителя в аэропорту и наслаждайтесь комфортным трансфером.",
    "landing.happyTravelers": "Довольных путешественников",
    "landing.onTimeRate": "Пунктуальность",
    "landing.customerSupport": "Служба поддержки",
    "landing.averageRating": "Средняя оценка",
    "landing.guestsSay": "Отзывы наших гостей",
    "landing.theDifference": "Наши преимущества",
    "landing.noHiddenFees":
      "Никаких скрытых платежей — прозрачные цены",
    "landing.freeCancellation":
      "Бесплатная отмена за 24 часа до поездки",
    "landing.flightTracking":
      "Отслеживание рейсов в реальном времени",
    "landing.proDrivers":
      "Профессиональные англоговорящие водители",
    "landing.modernVehicles":
      "Современные автомобили с кондиционером",
    "landing.doorToDoor":
      "Обслуживание от двери до двери по всему Египту",
    "landing.readyToBook": "Готовы заказать трансфер?",
    "landing.instantQuote":
      "Получите мгновенную цену и забронируйте менее чем за 2 минуты",

    // Track Booking
    "track.title": "Отследить бронирование",
    "track.enterRef":
      "Введите номер бронирования, чтобы проверить статус вашего трансфера.",
    "track.reference": "Номер бронирования",
    "track.placeholder": "напр. GB-240101-0001",
    "track.search": "Отследить",
    "track.notFound": "Бронирование не найдено. Пожалуйста, проверьте номер и попробуйте снова.",
    "track.bookingDetails": "Детали бронирования",
    "track.tripInfo": "Информация о поездке",
    "track.guestInfo": "Информация о госте",
    "track.flightDetails": "Данные рейса",
    "track.payment": "Оплата",
    "track.service": "Услуга",
    "track.date": "Дата",
    "track.pickupTime": "Время подачи",
    "track.passengers": "Пассажиры",
    "track.from": "Откуда",
    "track.to": "Куда",
    "track.hotel": "Отель",
    "track.vehicle": "Транспорт",
    "track.name": "Имя",
    "track.email": "Эл. почта",
    "track.phone": "Телефон",
    "track.country": "Страна",
    "track.flight": "Рейс",
    "track.airline": "Авиакомпания",
    "track.terminal": "Терминал",
    "track.method": "Способ оплаты",
    "track.status": "Статус",
    "track.total": "Итого",
    "track.notes": "Примечания",
    "track.payOnArrival": "Оплата по прибытии",
    "track.onlinePayment": "Онлайн-оплата",
    "track.cancelBooking": "Отменить бронирование",
    "track.bookingConfirmed": "Ваше бронирование подтверждено, водитель будет назначен. Данные водителя будут отправлены на вашу электронную почту до времени подачи.",
    "track.bookingCancelled": "Это бронирование было отменено.",
    "track.enterRefAbove": "Введите номер бронирования выше, чтобы просмотреть детали вашего заказа.",
    "track.statusPending": "Ожидание",
    "track.statusConfirmed": "Подтверждено",
    "track.statusAssigned": "Водитель назначен",
    "track.statusCompleted": "Завершено",
    "track.statusCancelled": "Отменено",
    "track.statusConverted": "Преобразовано в задание",

    // Footer
    "footer.quickLinks": "Быстрые ссылки",
    "footer.contactUs": "Связаться с нами",
    "footer.stayConnected": "Оставайтесь на связи",
    "footer.followUs":
      "Подписывайтесь на нас в социальных сетях, чтобы получать новости, советы путешественникам и специальные предложения.",
    "footer.rights": "Все права защищены.",
    "footer.about":
      "Профессиональные трансферные и транспортные услуги по всему Египту.",

    // Features
    "features.subtitle": "Ежегодно нам доверяют тысячи путешественников для надёжных и комфортных трансферов",
    "features.supportTitle": "Поддержка 24/7",
    "features.supportDesc": "Наша команда поддержки доступна круглосуточно, чтобы помочь вам с любыми вопросами или изменениями в бронировании.",
    "features.meetGreetTitle": "Встреча и приветствие",
    "features.meetGreetDesc": "Водитель встретит вас в зоне прилёта с табличкой с вашим именем, поможет с багажом и проводит до автомобиля.",
    "features.driversTitle": "Профессиональные водители",
    "features.driversDesc": "Лицензированные, опытные и проверенные водители с современными, ухоженными автомобилями для безопасной и комфортной поездки.",
    "features.flightTitle": "Мониторинг рейсов",
    "features.flightDesc": "Мы отслеживаем ваш рейс в реальном времени и автоматически корректируем время подачи при задержках или раннем прибытии.",
    "features.noFeesTitle": "Без скрытых платежей",
    "features.noFeesDesc": "Цена, которую вы видите — это цена, которую вы платите. Без наценок, без неожиданных расходов и бесплатная отмена за 24 часа.",
    "features.paymentTitle": "Безопасная оплата",
    "features.paymentDesc": "Оплачивайте безопасно онлайн или выберите оплату водителю по прибытии. Все транзакции зашифрованы и защищены.",

    // Testimonials
    "testimonial.1.quote": "Отличный сервис от начала до конца. Водитель ждал нас у выхода, а автомобиль был безупречен.",
    "testimonial.1.name": "Сара М.",
    "testimonial.1.location": "Лондон, Великобритания",
    "testimonial.2.quote": "Мы заказали дневной тур к Пирамидам. Водитель был дружелюбным, знающим и сделал нашу поездку незабываемой.",
    "testimonial.2.name": "Марко Р.",
    "testimonial.2.location": "Рим, Италия",
    "testimonial.3.quote": "Очень профессионально. Наш рейс задержался на 2 часа, но они отслеживали его и водитель всё равно был на месте. Настоятельно рекомендую!",
    "testimonial.3.name": "Джеймс К.",
    "testimonial.3.location": "Сидней, Австралия",

    // Admin-configured site content
    "site.heroTitle": "Закажите трансфер из аэропорта",
    "site.heroSubtitle": "Безопасные, комфортные и надёжные частные трансферы по всему Египту. От аэропорта до вашего отеля.",
    "site.featuresTitle": "Почему выбирают нас?",

    // Booking widget sub-components
    "booking.pickDate": "Выберите дату",
    "booking.pickTime": "Выберите время",
    "booking.searchPlaceholder": "Поиск…",
    "booking.noDestinations": "Для этого аэропорта направлений не найдено.",
    "booking.hourMinute": "Час · Минута",
    // Destination landing pages
    "destination.heroDesc": "Частные трансферы по фиксированной цене из {airport} ({iata}) до вашего отеля — отслеживание рейсов, бесплатная отмена и поддержка 24/7.",
    "destination.popularRoutes": "Популярные маршруты из {city}",
    "destination.fixedPrice": "Фиксированная цена — без скрытых платежей",
    "destination.freeCancellation": "Бесплатная отмена за 24ч",
    "destination.flightTracking": "Отслеживание рейсов в реальном времени",
    "destination.ctaTitle": "Закажите трансфер из аэропорта {city}",
    "destination.ctaDesc": "Мгновенная цена, безопасное бронирование и водитель, который будет ждать вас при прилёте.",
    // Airport Coverage & FAQ sections
    "landing.heroBadge": "Частные трансферы из аэропорта · Египет",
    "landing.airportCoverage": "Аэропорты в Египте",
    "landing.airportCoverageDesc": "Частные трансферы при прилёте и вылете из всех крупных египетских аэропортов прямо до вашего отеля или курорта.",
    "landing.faq": "Часто задаваемые вопросы",
    "booking.search": "Поиск",
    "booking.anywhereIn": "Везде в",
    "faq.q1": "Как заказать трансфер из аэропорта в Египте?",
    "faq.a1": "Введите на главной странице аэропорт отправления, пункт назначения, дату и количество пассажиров — вы мгновенно получите стоимость. Забронируйте и оплатите онлайн или выберите оплату по прибытии.",
    "faq.q2": "Что будет, если мой рейс задержится?",
    "faq.a2": "Мы отслеживаем все рейсы в режиме реального времени. При задержке время подачи водителя корректируется автоматически без дополнительной платы.",
    "faq.q3": "Могу ли я отменить трансфер?",
    "faq.a3": "Да. Бесплатная отмена доступна за 24 часа до запланированного трансфера.",
    "faq.q4": "Какие аэропорты Египта вы обслуживаете?",
    "faq.a4": "Мы обслуживаем все крупные аэропорты Египта: Хургада (HRG), Каир (CAI), Шарм-эш-Шейх (SSH), Луксор (LXR), Асуан (ASW), Марса-Алам (RMF) и Александрия (HBE).",
    "faq.q5": "Есть ли скрытые платежи?",
    "faq.a5": "Нет. Цена при бронировании — это цена, которую вы платите. Никаких надбавок, аэропортовых сборов и скрытых платежей.",

    // Common
    "common.loading": "Загрузка...",
    "common.error": "Что-то пошло не так",
    "common.bookAnother": "Заказать ещё один трансфер",
    "common.step": "Шаг",

    // Contact form
    "contact.name": "Имя",
    "contact.email": "Эл. почта",
    "contact.phone": "Телефон (необязательно)",
    "contact.subject": "Тема (необязательно)",
    "contact.message": "Сообщение",
    "contact.send": "Отправить сообщение",
    "contact.sending": "Отправка…",
    "contact.success": "Спасибо — мы свяжемся с вами в ближайшее время.",
    "contact.errorGeneric": "Что-то пошло не так. Пожалуйста, попробуйте снова.",
    "contact.errorTooMany": "Подождите немного и попробуйте снова.",
    "contact.errorCaptcha": "Проверка капчи не удалась. Пожалуйста, попробуйте снова.",
    "contact.required": "Это поле обязательно.",
    "contact.invalidEmail": "Пожалуйста, введите корректный адрес электронной почты.",
    "contact.namePlaceholder": "Ваше полное имя",
    "contact.emailPlaceholder": "ваш@email.ru",
    "contact.phonePlaceholder": "+7 999 123 45 67",
    "contact.subjectPlaceholder": "О чём ваш запрос?",
    "contact.messagePlaceholder": "Ваше сообщение…",

    // Cookie consent
    "cookie.title": "Мы используем файлы cookie",
    "cookie.body": "Мы используем файлы cookie для улучшения вашего опыта, анализа трафика сайта и отображения релевантного контента. Вы можете принять все, отклонить необязательные или выбрать нужные типы.",
    "cookie.accept": "Принять все",
    "cookie.reject": "Отклонить все",
    "cookie.manage": "Настроить",
    "cookie.manageTitle": "Настройки cookie",
    "cookie.essential": "Необходимые",
    "cookie.essentialDesc": "Необходимы для работы сайта. Не могут быть отключены.",
    "cookie.analytics": "Аналитика",
    "cookie.analyticsDesc": "Помогают нам понять, как посетители используют сайт.",
    "cookie.marketing": "Маркетинг",
    "cookie.marketingDesc": "Используются для показа релевантной рекламы и предложений.",
    "cookie.save": "Сохранить настройки",
  },
};

/* ------------------------------------------------------------------ */
/*  useWT hook                                                         */
/* ------------------------------------------------------------------ */

export function useWT(): (key: string) => string {
  const locale = useLocaleStore((s) => s.locale);

  return useCallback(
    (key: string): string => {
      const dict = translations[locale];
      if (dict && key in dict) return dict[key];

      // Fallback to English
      const en = translations.en;
      if (en && key in en) return en[key];

      // Fallback to key itself
      return key;
    },
    [locale]
  );
}

/* ------------------------------------------------------------------ */
/*  Locale-aware path helper                                           */
/* ------------------------------------------------------------------ */

// Returns a function that prepends the current locale to any internal path.
// e.g. useLocalePath()('/book') → '/en/book'
// Use in client components instead of hard-coded href values.
export function useLocalePath(): (path: string) => string {
  const locale = useLocaleStore((s) => s.locale);
  return (path: string) => {
    if (!path.startsWith('/')) return path; // External URL — leave as-is.
    return `/${locale}${path}`;
  };
}
