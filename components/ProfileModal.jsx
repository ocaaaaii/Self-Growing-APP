"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { THEMES } from "@/lib/constants";
import Modal from "./Modal";
import Mochi from "./Mochi";
import Bow from "./Bow";
import { useLocale } from "@/components/LocaleProvider";

// 主題預覽按鈕：主題背景色 + 對應 PNG 圖示
function ThemeCard({ t, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: t.bg,
        borderColor: selected ? t.accent : "rgba(0,0,0,0.06)",
      }}
      className="relative flex flex-col items-center overflow-hidden rounded-[18px] border-[3px] pb-2 pt-2.5 transition active:scale-95"
    >
      {/* selected glow */}
      {selected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[15px] opacity-10"
          style={{ background: t.accent }}
        />
      )}
      {/* theme icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.icon}
        alt={t.label}
        width={44}
        height={44}
        style={{ objectFit: "contain", display: "block" }}
      />
      {/* label */}
      <span
        className="mt-1 text-[10px] font-semibold"
        style={{ color: t.accent }}
      >
        {t.label}
      </span>
    </button>
  );
}

// Lets the user change their nickname + theme + sign out.
export default function ProfileModal({ open, onClose, currentNickname }) {
  const router = useRouter();
  const supabase = createClient();

  const { t, locale, setLocale, locales } = useLocale();

  const [nickname, setNickname] = useState(currentNickname || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("oat");
  const [themeSaving, setThemeSaving] = useState(false);

  // read the currently applied theme when the modal opens
  useEffect(() => {
    if (open) {
      setNickname(currentNickname || "");
      setTheme(document.documentElement.dataset.theme || "oat");
    }
  }, [open, currentNickname]);

  async function saveNickname() {
    const clean = nickname.trim();
    if (!clean) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // upsert：profile 不存在就新建、存在就更新
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, username: clean }, { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("更新沒有生效，請稍後再試");

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        router.refresh();
      }, 900);
    } catch (err) {
      alert("沒能更新暱稱，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  async function pickTheme(key) {
    // apply instantly for live preview
    document.documentElement.dataset.theme = key;
    setTheme(key);
    setThemeSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, theme: key }, { onConflict: "id" });
      if (error) throw error;
    } catch (err) {
      alert("主題沒能存起來，再試一次：" + (err?.message || ""));
    } finally {
      setThemeSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <button
        onClick={onClose}
        className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
      >
        ✕
      </button>

      <div className="mb-4 flex flex-col items-center text-center">
        <Mochi mood="loving" size={80} />
        <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
          <Bow size={20} /> {t("profile.title")}
        </h2>
      </div>

      {/* nickname */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("profile.nickname")}
        </label>
        <input
          value={nickname}
          maxLength={20}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("profile.nicknamePlaceholder")}
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
        <p className="mt-1.5 text-[11px] text-milktea">
          {t("profile.nicknameHint")}
        </p>
      </div>

      <button
        onClick={saveNickname}
        disabled={saving || !nickname.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saved ? t("profile.saved") : saving ? t("common.saving") : t("profile.saveNickname")}
      </button>

      {/* theme picker */}
      <div className="mb-3.5 mt-5">
        <label className="mb-2 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("profile.theme")}{themeSaving && <span className="text-milktea"> · {t("profile.themeSaving")}</span>}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((thm) => (
            <ThemeCard
              key={thm.key}
              t={thm}
              selected={theme === thm.key}
              onClick={() => pickTheme(thm.key)}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-milktea">
          {t("profile.themeHint")}
        </p>
      </div>

      {/* language picker */}
      <div className="mb-3.5 mt-5">
        <label className="mb-2 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("profile.language")}
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        >
          {locales.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.flag} {loc.label}
            </option>
          ))}
        </select>
      </div>

      <form action="/auth/signout" method="post" className="mt-2.5">
        <button
          type="submit"
          className="w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa"
        >
          {t("profile.signOut")}
        </button>
      </form>
    </Modal>
  );
}
