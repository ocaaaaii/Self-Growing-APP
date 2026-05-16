"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Mochi from "./Mochi";

// After redeeming a reward — let the user snap a photo + leave a note.
// If a photo is uploaded, we ask Claude vision (via /api/reward-comment)
// to look at it and write a warm comment from Mochi.
//
// Phases:
//   "form"     — pick photo + write note + save
//   "thinking" — uploading + waiting for AI
//   "reveal"   — show Mochi's comment about the photo
export default function JoyRecordModal({
  open,
  onClose,
  historyId,
  rewardTitle,
  onSaved,
}) {
  const supabase = createClient();
  const [phase, setPhase] = useState("form");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState("");
  const [aiComment, setAiComment] = useState("");

  // reset when modal closes/opens fresh
  useEffect(() => {
    if (open) {
      setPhase("form");
      setFile(null);
      setPreview(null);
      setNote("");
      setAiComment("");
    }
  }, [open]);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function skip() {
    onClose();
  }

  async function save() {
    if (!historyId) return skip();
    setPhase("thinking");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. upload photo (if any)
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

      // 2. write photo_url + note to reward_history
      const { error: updErr } = await supabase
        .from("reward_history")
        .update({
          photo_url: photoUrl,
          note: note.trim() || null,
        })
        .eq("id", historyId);
      if (updErr) throw updErr;

      // 3. ask Claude to comment on the photo
      let comment = null;
      try {
        const res = await fetch("/api/reward-comment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            photoUrl,
            rewardTitle,
            note: note.trim(),
          }),
        });
        if (res.ok) {
          const d = await res.json();
          comment = d?.comment || null;
        }
      } catch {
        // ignore — fall through to fallback
      }
      if (!comment) {
        comment = `「${rewardTitle}」看起來很棒！你值得這份開心 🎀`;
      }

      // 4. save the AI comment back to reward_history
      await supabase
        .from("reward_history")
        .update({ ai_comment: comment })
        .eq("id", historyId);

      setAiComment(comment);
      setPhase("reveal");
      onSaved?.();
    } catch (err) {
      alert("沒能記下來，再試一次：" + (err?.message || ""));
      setPhase("form");
    }
  }

  return (
    <Modal open={open} onClose={skip} className="text-center">
      {phase === "form" && (
        <>
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
              className="btn-cocoa rounded-2xl py-3.5 text-sm font-semibold shadow-soft"
            >
              記下來 📸
            </button>
          </div>
        </>
      )}

      {phase === "thinking" && (
        <div className="py-6">
          <div className="mx-auto" style={{ width: 96 }}>
            <Mochi mood="happy" size={96} />
          </div>
          <p className="mt-4 animate-pulseSoft text-[14px] font-medium text-cocoa-deep">
            mochi 正在看你的照片…
          </p>
          <p className="mt-1 text-[11px] text-milktea">幫你記下這份喜悅</p>
        </div>
      )}

      {phase === "reveal" && (
        <>
          <div className="mx-auto mb-3 mt-2 animate-bounceIn" style={{ width: 110 }}>
            <Mochi mood="loving" size={110} />
          </div>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="兌換照片"
              className="mx-auto mb-3 h-32 w-full rounded-2xl object-cover"
            />
          )}
          <div className="rounded-2xl bg-cream-card px-4 py-3 text-[14px] font-medium leading-relaxed text-cocoa-deep">
            🐻💬 「{aiComment}」
          </div>
          <button
            onClick={onClose}
            className="btn-cocoa mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold shadow-soft"
          >
            謝謝 mochi 🎀
          </button>
        </>
      )}
    </Modal>
  );
}
