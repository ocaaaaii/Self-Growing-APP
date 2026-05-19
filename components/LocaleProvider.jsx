"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMessage, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const LocaleContext = createContext(null);

export function LocaleProvider({ children, initialLocale, initialMessages }) {
  const supabase = createClient();
  const [locale, setLocaleState] = useState(initialLocale || DEFAULT_LOCALE);
  const [messages, setMessages] = useState(initialMessages || {});

  const setLocale = useCallback(async (newLocale) => {
    // Validate
    const supported = LOCALES.map((l) => l.code);
    if (!supported.includes(newLocale)) return;

    // Load messages dynamically
    try {
      const mod = await import(`@/lib/i18n/messages/${newLocale}.json`);
      const msgs = mod.default ?? mod;
      setMessages(msgs);
      setLocaleState(newLocale);

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", newLocale);
      }

      // Persist to Supabase (best-effort)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, locale: newLocale }, { onConflict: "id" });
      }
    } catch (err) {
      console.warn("Failed to load locale", newLocale, err);
    }
  }, [supabase]);

  // On first mount: if localStorage has a locale set during signup/previous visit,
  // load it (overrides the server-rendered default if different).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved && saved !== locale && LOCALES.some((l) => l.code === saved)) {
        setLocale(saved); // loads messages + persists to Supabase
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback((key, vars) => getMessage(messages, key, vars), [messages]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
