import type { Locale } from './i18n-config';

export interface NotFoundCopy {
  code: string;
  title: string;
  description: string;
  home: string;
  book: string;
}

// Self-contained copy for the 404 page so both not-found boundaries
// (app/not-found.tsx and app/[locale]/not-found.tsx) stay localized without
// touching the large website-translations dictionary.
export const NOT_FOUND_COPY: Record<Locale, NotFoundCopy> = {
  en: {
    code: '404',
    title: 'Page not found',
    description:
      "Sorry, we couldn't find the page you're looking for. It may have moved or no longer exists.",
    home: 'Back to home',
    book: 'Book a transfer',
  },
  ar: {
    code: '404',
    title: 'الصفحة غير موجودة',
    description:
      'عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو لم تعد موجودة.',
    home: 'العودة إلى الرئيسية',
    book: 'احجز رحلة',
  },
  de: {
    code: '404',
    title: 'Seite nicht gefunden',
    description:
      'Entschuldigung, die gesuchte Seite konnte nicht gefunden werden. Möglicherweise wurde sie verschoben oder existiert nicht mehr.',
    home: 'Zur Startseite',
    book: 'Transfer buchen',
  },
  fr: {
    code: '404',
    title: 'Page introuvable',
    description:
      "Désolé, nous n'avons pas trouvé la page que vous recherchez. Elle a peut-être été déplacée ou n'existe plus.",
    home: "Retour à l'accueil",
    book: 'Réserver un transfert',
  },
  it: {
    code: '404',
    title: 'Pagina non trovata',
    description:
      'Spiacenti, non abbiamo trovato la pagina che stai cercando. Potrebbe essere stata spostata o non esistere più.',
    home: 'Torna alla home',
    book: 'Prenota un transfer',
  },
  nl: {
    code: '404',
    title: 'Pagina niet gevonden',
    description:
      'Sorry, we konden de pagina die je zoekt niet vinden. Mogelijk is deze verplaatst of bestaat niet meer.',
    home: 'Terug naar home',
    book: 'Boek een transfer',
  },
  ru: {
    code: '404',
    title: 'Страница не найдена',
    description:
      'Извините, мы не смогли найти запрашиваемую страницу. Возможно, она была перемещена или больше не существует.',
    home: 'На главную',
    book: 'Заказать трансфер',
  },
};

export function notFoundCopy(locale: string): NotFoundCopy {
  return NOT_FOUND_COPY[locale as Locale] ?? NOT_FOUND_COPY.en;
}
