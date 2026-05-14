"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Mochi from "./Mochi";
import Bow from "./Bow";

// Lets the user change their nickname + sign out.
export default function ProfileModal({ open, onClose, currentNickname }) {
  const router = useRouter();
  const supabase = createClient();

  const [nickname, setNickname] = useState(currentNickname || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveNickname() {
    const clean = nickname.trim();
    if (!clean) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ username: clean })
        .eq("id", user.id);
      if (error) throw error;
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
        className="w-full rounded-2xl py-3.5 text-[15px] font-semibold text-cream-card shadow-soft transition hover:-translate-y-px disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
      >
        {saved ? "已儲存 ✓" : saving ? "儲存中…" : "儲存暱稱 ✨"}
      </button>

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
