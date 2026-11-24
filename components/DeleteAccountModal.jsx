"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Mochi from "./Mochi";
import { useLocale } from "@/components/LocaleProvider";
import { REWARD_PHOTO_BUCKET } from "@/lib/rewardPhotos";

// Permanently deletes the signed-in account. The user must type the confirm
// word first. Photos in storage are removed here (SQL can't delete storage
// files); delete_my_account() then removes auth.users, and every table that
// references it cascades.
export default function DeleteAccountModal({ open, onClose }) {
  const supabase = createClient();
  const { t } = useLocale();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const word = t("account.confirmWord");
  const ready = typed.trim() === word && !busy;

  function close() {
    if (busy) return;
    setTyped("");
    setError("");
    onClose?.();
  }

  async function handleDelete() {
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      // 1. remove this user's reward photos (their own folder only)
      const bucket = supabase.storage.from(REWARD_PHOTO_BUCKET);
      const { data: files } = await bucket.list(user.id, { limit: 1000 });
      const paths = (files || []).filter((f) => f?.name).map((f) => `${user.id}/${f.name}`);
      if (paths.length) await bucket.remove(paths);

      // 2. delete the account; all app data cascades
      const { error: rpcError } = await supabase.rpc("delete_my_account");
      if (rpcError) throw rpcError;

      // 3. clear the local session and leave
      await supabase.auth.signOut().catch(() => {});
      window.location.replace("/welcome");
    } catch (err) {
      console.error("[delete-account]", err);
      setError(t("account.error"));
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={close} label={t("account.title")}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <div className="flex flex-col items-center text-center">
        <Mochi mood="sad" size={72} />
        <h2 className="mt-3 text-lg font-semibold text-cocoa-deep">{t("account.title")}</h2>
      </div>

      <div className="mt-3 space-y-2 text-sm leading-relaxed text-cocoa-deep">
        <p>{t("account.body")}</p>
        <p className="text-muted">{t("account.feedbackNote")}</p>
      </div>

      <label htmlFor="delete-confirm" className="mt-5 block text-xs font-semibold text-accent">
        {t("account.typeLabel", { word })}
      </label>
      <input
        id="delete-confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        disabled={busy}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream-paper px-3 py-3 text-[15px] outline-none focus:border-cocoa-soft"
      />

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-dusty/25 px-3 py-2 text-sm text-cocoa-deep">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={!ready}
        className="mt-5 w-full rounded-2xl bg-cocoa-deep py-3.5 text-[15px] font-semibold text-cream-card transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
      >
        {busy ? t("account.deleting") : t("account.confirm")}
      </button>
      <button
        type="button"
        onClick={close}
        disabled={busy}
        className="mt-2.5 w-full rounded-2xl bg-beige/70 py-3 text-sm font-semibold text-accent"
      >
        {t("ui.notNow")}
      </button>
    </Modal>
  );
}
