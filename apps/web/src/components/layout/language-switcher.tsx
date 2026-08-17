"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isLocale, LANGUAGE_STORAGE_KEY, type Locale } from "../../i18n/config";
import styles from "./smart-ops-app.module.css";

const languageOptions: Array<{ locale: Locale; label: string }> = [
  { locale: "ko", label: "KO" },
  { locale: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const activeLanguage = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : "ko";

  const changeLanguage = (locale: Locale) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      className={styles.languageSwitcher}
      role="group"
      aria-label={t("layout.languageSwitcher.label")}
    >
      <Languages size={14} aria-hidden="true" />

      {languageOptions.map(({ locale, label }) => (
        <button
          type="button"
          className={activeLanguage === locale ? styles.activeLanguage : ""}
          aria-pressed={activeLanguage === locale}
          title={t(`layout.languageSwitcher.${locale}`)}
          key={locale}
          onClick={() => changeLanguage(locale)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
