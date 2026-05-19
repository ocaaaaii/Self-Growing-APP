"use client";

import { useLocale } from "@/components/LocaleProvider";

// One If→Then rule card.
export default function IfThenCard({ rule, onEdit, onToggle, busy }) {
  const { t } = useLocale();
  return (
    <div
      className={`rounded-[20px] border border-line/40 bg-cream-card p-4 shadow-soft transition ${
        rule.is_enabled ? "" : "opacity-55"
      }`}
    >
      <div onClick={() => onEdit(rule)} className="cursor-pointer">
        <div className="flex items-start gap-2.5 text-[13px] leading-relaxed text-cocoa">
          <span className="mt-px flex-shrink-0 rounded-lg bg-dusty/40 px-2 py-0.5 text-[10px] font-bold tracking-wide text-cocoa">
            IF
          </span>
          <span>{rule.trigger_condition}</span>
        </div>
        <div className="my-1.5 text-center text-sm text-cocoa-soft">↓</div>
        <div className="flex items-start gap-2.5 text-[13px] font-medium leading-relaxed text-cocoa-deep">
          <span className="mt-px flex-shrink-0 rounded-lg bg-sage px-2 py-0.5 text-[10px] font-bold tracking-wide text-cocoa">
            THEN
          </span>
          <span>{rule.action_response}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-line pt-2.5">
        <span className="text-[10px] text-milktea">{rule.category}</span>
        <button
          onClick={() => !busy && onToggle(rule)}
          className={`flex items-center gap-1.5 text-[10px] font-semibold ${
            rule.is_enabled ? "text-cocoa" : "text-milktea"
          }`}
        >
          <span
            className={`relative h-4 w-7 rounded-full transition ${
              rule.is_enabled ? "bg-sage" : "bg-milktea-soft"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                rule.is_enabled ? "left-3.5" : "left-0.5"
              }`}
            />
          </span>
          {rule.is_enabled ? t("ifthen.enabled") : t("ifthen.paused")}
        </button>
      </div>
    </div>
  );
}
