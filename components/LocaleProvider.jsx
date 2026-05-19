"use client";

import { createContext, useContext, useState, useCallback } from "react";
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
