import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import ar from "./ar.json";
import en from "./en.json";
import fr from "./fr.json";
import tr from "./tr.json";
import ur from "./ur.json";

type Locale = "ar" | "en" | "fr" | "tr" | "ur";
type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const dictionaries: Record<Locale, Messages> = { ar, en, fr, tr, ur };

const detectInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem("mashrok.locale") as Locale | null;
  if (stored && dictionaries[stored]) return stored;
  const browser = (navigator.language || "").toLowerCase();
  if (browser.startsWith("ar")) return "ar";
  if (browser.startsWith("fr")) return "fr";
  if (browser.startsWith("tr")) return "tr";
  if (browser.startsWith("ur")) return "ur";
  return "en";
};

let currentLocale: Locale = detectInitialLocale();
const listeners = new Set<() => void>();

const resolveKey = (messages: Messages, key: string): unknown => {
  return key.split(".").reduce((acc: unknown, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, messages);
};

const interpolate = (value: string, params?: Record<string, string | number>): string => {
  if (!params) return value;
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) => {
    const replacement = params[key];
    return replacement === undefined ? "" : String(replacement);
  });
};

const updateHtmlMeta = (locale: Locale): void => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";
};

export const getLocale = (): Locale => currentLocale;

export const setLocale = (locale: Locale): void => {
  if (!dictionaries[locale]) return;
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("mashrok.locale", locale);
  }
  updateHtmlMeta(locale);
  listeners.forEach((listener) => listener());
};

export const t = (key: string, params?: Record<string, string | number>): string => {
  const dict = dictionaries[currentLocale] || dictionaries.ar;
  let value = resolveKey(dict, key);
  if (value === undefined) value = resolveKey(dictionaries.ar, key);
  if (typeof value !== "string") return key;
  return interpolate(value, params);
};

const I18nContext = createContext<I18nContextValue>({
  locale: currentLocale,
  setLocale,
  t,
});

export const I18nProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    const handler = (): void => setLocaleState(getLocale());
    listeners.add(handler);
    updateHtmlMeta(getLocale());
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => useContext(I18nContext);