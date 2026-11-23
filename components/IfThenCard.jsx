"use client";

import { useLocale } from "@/components/LocaleProvider";
import Icon from "./Icon";
import { splitEmojiLabel } from "@/lib/icons";

// One If→Then rule card. Tapping the text edits it; the switch pauses it.
export default function IfThenCard({ rule, onEdit, onToggle, busy }) {
  const { t } = useLocale();
  const translated = t(`ifthenCategories.${rule.category}`);
  const cat = splitEmojiLabel(rule.category);
  const catLabel =
    translated && !translated.startsWith("ifthenCategories.") ? translated : cat.label;

  return (
    <div
      className={`rounded-[20px] border border-line/40 bg-cream-card p-4 shadow-soft transition ${
        rule.is_enabled ? "" : "opacity-70"
      }`}
    >
      <button
        type="button"
        onClick={() => onEdit(rule)}
        className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
        aria-label={t("ui.editRule", { text: rule.trigger_condition })}
      >
        <div className="flex items-start gap-2.5 text-[14px] leading-relaxed text-cocoa-deep">
          <span className="mt-px flex-shrink-0 rounded-lg bg-beige px-2 py-0.5 text-xs font-semibold text-cocoa-deep">
            {t("ui.if")}
          </span>
          <span>{rule.trigger_condition}</span>
        </div>
        <div className="my-1 pl-[13px] text-muted" aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </div>
        <div className="flex items-start gap-2.5 text-[14px] font-medium leading-relaxed text-cocoa-deep">
          <span className="mt-px flex-shrink-0 rounded-lg bg-sage/50 px-2 py-0.5 text-xs font-semibold text-cocoa-deep">
            {t("ui.then")}
          </span>
          <span>{rule.action_response}</span>
        </div>
      </button>

      <div className="mt-2 flex items-center justify-between border-t border-dashed border-line pt-1">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Icon name={cat.icon} size={14} />
          {catLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={!!rule.is_enabled}
          onClick={() => !busy && onToggle(rule)}
          className={`-mr-2 flex min-h-[40px] items-center gap-2 rounded-xl px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50 ${
            rule.is_enabled ? "text-accent" : "text-muted"
          }`}
        >
          <span
            className={`relative h-5 w-9 rounded-full transition ${
              rule.is_enabled ? "bg-cocoa" : "bg-milktea-soft"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-cream-card shadow-sm transition-all ${
                rule.is_enabled ? "left-[18px]" : "left-0.5"
              }`}
            />
          </span>
          {rule.is_enabled ? t("ifthen.enabled") : t("ifthen.paused")}
        </button>
      </div>
    </div>
  );
}
