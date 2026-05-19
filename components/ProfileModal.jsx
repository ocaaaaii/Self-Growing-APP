"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { THEMES } from "@/lib/constants";
import Modal from "./Modal";
import Mochi from "./Mochi";
import Bow from "./Bow";

// 帶 Mochi 的主題預覽按鈕
function ThemeCard({ t, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: t.bg,
        borderColor: selected ? t.accent : "transparent",
        "--cheek-color": t.cheek,
      }}
      className="relative flex flex-col items-center overflow-hidden rounded-[18px] border-[3px] pb-1.5 pt-2 transition active:scale-95"
    >
      {/* selected ring glow */}
      {selected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[15px] opacity-20"
          style={{ background: t.accent }}
        />
      )}
      {/* Mochi with theme cheek color */}
      <div
        className="relative"
        style={{ "--c-cheek": t.cheek.replace("rgb(", "").replace(")", "").split(",").join(" ") }}
      >
        <Mochi mood="happy" size={46} />
      </div>
      {/* label */}
      <span
        className="mt-0.5 text-[10px] font-semibold"
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
          <Bow size={20} /> 我的小空間
        </h2>
      </div>

      {/* nickname */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          暱稱
        </label>
        <input
          value={nickname}
          maxLength={20}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="想讓 mochi 怎麼稱呼你？"
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
        <p className="mt-1.5 text-[11px] text-milktea">
          改好之後，mochi 問候你時就會用新的暱稱 🌱
        </p>
      </div>

      <button
        onClick={saveNickname}
        disabled={saving || !nickname.trim()}
        className="btn-cocoa w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saved ? "已儲存 ✓" : saving ? "儲存中…" : "儲存暱稱 ✨"}
      </button>

      {/* theme picker */}
      <div className="mb-3.5 mt-5">
        <label className="mb-2 block text-[11px] font-semibold tracking-wide text-cocoa">
          主題色 {themeSaving && <span className="text-milktea">· 儲存中…</span>}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <ThemeCard
              key={t.key}
              t={t}
              selected={theme === t.key}
              onClick={() => pickTheme(t.key)}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-milktea">
          點一下就會立刻換上，整個 App 都會跟著變 ✨
        </p>
      </div>

      <form action="/auth/signout" method="post" className="mt-2.5">
        <button
          type="submit"
          className="w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa"
        >
          登出
        </button>
      </form>
    </Modal>
  );
}
