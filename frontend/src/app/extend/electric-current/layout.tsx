"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import Cookies from 'js-cookie';
import { loadTranslations } from '@/utils/api';

// Language context for i18n
const LanguageContext = createContext({
  lang: 'en',
  setLang: (lang: string) => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const cookieLang = Cookies.get('lang');
    const initialLang = cookieLang || lang;
    setLang(initialLang);
    loadTranslations(initialLang).then(setTranslations).catch(() => setTranslations({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTranslations(lang).then(setTranslations).catch(() => setTranslations({}));
  }, [lang]);

  const t = (key: string) => translations[key] || key;

  const setLangAndCookie = (newLang: string) => {
    Cookies.set('lang', newLang, { expires: 365 });
    setLang((prev) => {
      if (prev !== newLang) {
        loadTranslations(newLang).then(setTranslations).catch(() => setTranslations({}));
      }
      return newLang;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndCookie, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default function ExtendElectricLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
  