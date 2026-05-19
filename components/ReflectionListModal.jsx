"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import Bow from "./Bow";

export default function ReflectionListModal({ open, onClose }) {
  const supabase = createClient();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("daily_reflections")
          .select("id, entry_date, reflection, points_earned, created_at")
          .eq("user_id", user.id)
          .order("entry_date", { ascending: false })
          .limit(60);
        if (!error) setEntries(data || []);
      } catch (_) {}
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("zh-TW", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
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

      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
        <Bow size={20} /> 復盤日誌
      </h2>
      <p className="mb-[18px] text-xs text-milktea">
        每一次誠實，都是對自己最溫柔的照顧
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-milktea">
          載入中…
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="mb-2 text-3xl">🌙</span>
          <p className="text-sm font-medium text-cocoa-deep">還沒有復盤紀錄</p>
          <p className="mt-1 text-xs text-milktea">
            每天誠實面對自己，就會慢慢出現在這裡
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-3"
            >
              {/* date + points */}
              <div className="mb-2 flex items-center justify-between">
                <span className="font-hand text-[13px] text-cocoa-soft">
                  {formatDate(e.entry_date)}
                </span>
                {e.points_earned > 0 && (
                  <span className="rounded-lg bg-cream-bg px-2 py-0.5 text-[10px] font-bold text-cocoa">
                    +{e.points_earned} pt
                  </span>
                )}
              </div>
              {/* reflection text */}
              <p className="text-[13px] leading-relaxed text-cocoa-deep">
                {e.reflection}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
