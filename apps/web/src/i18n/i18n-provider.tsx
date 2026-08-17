"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nReady } from "./i18n";
import styles from "./i18n-provider.module.css";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    let active = true;
    const handleLanguageChanged = (language: string) => {
      document.documentElement.lang = language;
    };

    i18n.on("languageChanged", handleLanguageChanged);
    handleLanguageChanged(i18n.resolvedLanguage ?? i18n.language);

    void i18nReady.then(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {ready ? children : <div className={styles.loading} aria-hidden="true" />}
    </I18nextProvider>
  );
}
