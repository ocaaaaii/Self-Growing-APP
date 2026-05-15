"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Mochi from "./Mochi";

// After redeeming a reward — let the user snap a photo + leave a note
// to remember the joy. Both are optional ("先跳過" just closes).
export default function JoyRecordModal({
  open,
  onClose,
  historyId,
  rewardTitle,
  onSaved,
}) {
  const supabase = createClient();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setNote("");
  }

  function skip() {
    reset();
    onClose();
  }

  async function save() {
    if (!historyId) return skip();
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let photoUrl = null;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${historyId}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("reward-photos")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("reward-photos")
          .getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }

      const { error } = await supabase
        .from("reward_history")
        .update({ photo_url: photoUrl, note: note.trim() || null })
        .eq("id", historyId);
      if (error) throw error;

      onSaved?.();
      reset();
      onClose();
    } catch (err) {
      alert("沒能記下來，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={skip} className="text-center">
      <div className="mx-auto mb-3 mt-2 animate-bounceIn" style={{ width: 96 }}>
        <Mochi mood="loving" size={96} />
      </div>
      <h2 className="text-xl font-semibold text-cocoa-deep">兌換成功！🎀</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">
        好好享受「{rewardTitle}」— 你值得 💕
        <br />
        要不要拍張照、留句話，記住這份喜悅？
      </p>

      {/* photo picker */}
      <label className="mt-4 block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pickFile}
          className="hidden"
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="兌換照片"
            className="mx-auto h-40 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream-card text-milktea">
            <span className="text-3xl">📸</span>
            <span className="mt-1 text-xs">點一下拍照 / 選一張照片</span>
          </div>
        )}
      </label>

      {/* note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="想對這份喜悅說的話…"
        className="mt-3 min-h-[60px] w-full resize-none rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
      />

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          onClick={skip}
          className="rounded-2xl bg-beige py-3.5 text-sm font-semibold text-cocoa"
        >
          先跳過
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="btn-cocoa rounded-2xl py-3.5 text-sm font-semibold shadow-soft disabled:opacity-60"
        >
          {saving ? "記下中…" : "記下來 📸"}
        </button>
      </div>
    </Modal>
  );
}
