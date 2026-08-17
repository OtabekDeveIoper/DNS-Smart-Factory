import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  isLocale,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
} from "./config";

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (isLocale(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language.split("-")[0];

  return isLocale(browserLanguage) ? browserLanguage : DEFAULT_LOCALE;
}

export const i18nReady =
  typeof window === "undefined" || i18n.isInitialized
    ? Promise.resolve(i18n.t)
    : i18n
        .use(HttpBackend)
        .use(initReactI18next)
        .init({
          backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
          },
          defaultNS: "common",
          fallbackLng: DEFAULT_LOCALE,
          interpolation: {
            escapeValue: false,
          },
          lng: getInitialLanguage(),
          load: "languageOnly",
          ns: ["common"],
          react: {
            useSuspense: false,
          },
          supportedLngs: [...SUPPORTED_LOCALES],
        });

export default i18n;
