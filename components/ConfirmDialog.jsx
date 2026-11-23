"use client";

import { useCallback, useRef, useState } from "react";
import Modal from "./Modal";
import Mochi from "./Mochi";

// Replaces window.confirm() with a sheet in the app's own look.
//
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm({ title, body, confirmLabel }))) return;
//   ...
//   return <>{...}{confirmDialog}</>;
export function useConfirm() {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (o) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOpts(o);
      }),
    []
  );

  const settle = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  };

  const dialog = (
    <ConfirmDialog
      open={!!opts}
      title={opts?.title}
      body={opts?.body}
      confirmLabel={opts?.confirmLabel}
      cancelLabel={opts?.cancelLabel}
      destructive={opts?.destructive ?? true}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return [confirm, dialog];
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "確定",
  cancelLabel = "先不要",
  destructive = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} label={title}>
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
      <div className="flex flex-col items-center text-center">
        <Mochi mood={destructive ? "sad" : "happy"} size={72} />
        <h2 className="mt-3 text-[17px] font-semibold text-cocoa-deep">{title}</h2>
        {body && <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>}
      </div>
      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onConfirm}
          className={`w-full rounded-2xl py-3.5 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50 ${
            destructive ? "bg-cocoa-deep text-cream-card" : "btn-cocoa"
          }`}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
        >
          {cancelLabel}
        </button>
      </div>
    </Modal>
  );
}
