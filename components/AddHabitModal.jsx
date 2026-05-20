"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Bow from "./Bow";
import { DIFFICULTY, CATEGORIES, FREQUENCIES, EMOJI_CHOICES } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-[7px] text-xs font-medium transition ${
        active
          ? "border-cocoa bg-cocoa text-cream-card"
          : "border-line bg-cream-card text-cocoa"
      }`}
    >
      {children}
    </button>
  );
}

function DayPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition ${
        active
          ? "border-cocoa bg-cocoa text-cream-card"
          : "border-line bg-cream-card text-cocoa"
      }`}
    >
      {children}
    </button>
  );
}

// Add OR edit a habit. Pass `habit` to edit, omit to add.
export default function AddHabitModal({ open, onClose, onSave, onDelete, habit, saving }) {
  const editing = !!habit;
  const { t } = useLocale();
  const DAY_LABELS = [
    t("addHabit.days_sun"),
    t("addHabit.days_mon"),
    t("addHabit.days_tue"),
    t("addHabit.days_wed"),
    t("addHabit.days_thu"),
    t("addHabit.days_fri"),
    t("addHabit.days_sat"),
  ];
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [diffIdx, setDiffIdx] = useState(0);
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [scheduleDays, setScheduleDays] = useState([]); // 0=日…6=六

  // sync form when opening (for both add & edit)
  useEffect(() => {
    if (!open) return;
    if (habit) {
      setName(habit.title || "");
      setEmoji(habit.emoji || EMOJI_CHOICES[0]);
      setCategory(habit.category || CATEGORIES[0]);
      const di = DIFFICULTY.findIndex((d) => d.label === habit.difficulty);
      setDiffIdx(di >= 0 ? di : 0);
      // 向下相容：舊習慣儲存的是 "每週 3 次"，統一對應到 "每週自訂"
      const freq = habit.frequency === "每週 3 次" ? "每週自訂" : (habit.frequency || FREQUENCIES[0]);
      setFrequency(freq);
      setScheduleDays(habit.schedule_days || []);
    } else {
      setName("");
      setEmoji(EMOJI_CHOICES[0]);
      setCategory(CATEGORIES[0]);
      setDiffIdx(0);
      setFrequency(FREQUENCIES[0]);
      setScheduleDays([]);
    }
  }, [open, habit]);

  function toggleDay(day) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSave() {
    const d = DIFFICULTY[diffIdx];
    onSave({
      title: name.trim() || "新的小事",
      emoji,
      category,
      difficulty: d.label,
      point_value: d.points,
      frequency,
      // 只有「每週自訂」才儲存 schedule_days，其他設為 null
      schedule_days: frequency === "每週自訂" ? scheduleDays : null,
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
        <Bow size={20} /> {editing ? t("addHabit.titleEdit") : t("addHabit.titleAdd")}
      </h2>
      <p className="mb-[18px] text-xs text-milktea">{t("addHabit.subtitle")}</p>

      {/* name */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addHabit.name")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("addHabit.namePlaceholder")}
          className="w-full rounded-[14px] border border-line bg-cream-card px-3.5 py-3 text-sm text-cocoa-deep outline-none focus:border-cocoa-soft focus:bg-white"
        />
      </div>

      {/* emoji */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addHabit.emoji")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl border text-lg transition ${
                emoji === e
                  ? "border-cocoa bg-cocoa"
                  : "border-line bg-cream-card"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* category */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addHabit.category")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {t(`categories.${c}`) || c}
            </Pill>
          ))}
        </div>
      </div>

      {/* difficulty */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addHabit.difficulty")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY.map((d, i) => (
            <Pill key={d.label} active={diffIdx === i} onClick={() => setDiffIdx(i)}>
              {t(`difficulty.${d.label}`) || d.label} · {d.points}pt
            </Pill>
          ))}
        </div>
      </div>

      {/* frequency */}
      <div className="mb-3.5">
        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-cocoa">
          {t("addHabit.frequency")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FREQUENCIES.map((f) => (
            <Pill
              key={f}
              active={frequency === f}
              onClick={() => {
                setFrequency(f);
                if (f !== "每週自訂") setScheduleDays([]);
              }}
            >
              {t(`frequency.${f}`) || f}
            </Pill>
          ))}
        </div>
      </div>

      {/* 每週自訂：選擇哪幾天（任意天數） */}
      {frequency === "每週自訂" && (
        <div className="mb-3.5 rounded-[14px] border border-line bg-cream-card/60 px-3.5 py-3">
          <label className="mb-2 block text-[11px] font-semibold tracking-wide text-cocoa">
            {t("addHabit.scheduleDays")}
            <span className="ml-1.5 font-normal text-milktea">（{t("addHabit.scheduleDaysHint")}）</span>
          </label>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <DayPill
                key={i}
                active={scheduleDays.includes(i)}
                onClick={() => toggleDay(i)}
              >
                {label}
              </DayPill>
            ))}
          </div>
          {scheduleDays.length > 0 && (
            <p className="mt-2 text-[11px] text-cocoa-soft">
              {t("addHabit.scheduleAppearNote", { days: scheduleDays.sort((a,b)=>a-b).map((d) => DAY_LABELS[d]).join("、") })}
            </p>
          )}
        </div>
      )}

      {/* 頻率說明 */}
      <div className="mb-4 rounded-[12px] bg-beige/60 px-3 py-2.5 text-[11px] leading-relaxed text-milktea">
        {frequency === "每日" && t("addHabit.freq_daily_hint")}
        {frequency === "平日" && t("addHabit.freq_weekday_hint")}
        {frequency === "每週自訂" &&
          (scheduleDays.length > 0
            ? t("addHabit.freq_custom_hint_days", { n: scheduleDays.length })
            : t("addHabit.freq_custom_hint_nodays"))}
        {frequency === "自由" && t("addHabit.freq_free_hint")}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-cocoa mt-2 w-full rounded-2xl py-3.5 text-[15px] font-semibold shadow-soft transition hover:-translate-y-px disabled:opacity-60"
      >
        {saving ? t("common.saving") : editing ? t("addHabit.saveEdit") : t("addHabit.saveAdd")}
      </button>

      {editing && (
        <button
          onClick={() => {
            if (!confirm(t("addHabit.confirmDelete", { title: habit.title }))) return;
            onDelete(habit);
          }}
          className="mt-2.5 w-full rounded-2xl bg-beige py-3 text-sm font-semibold text-cocoa-deep"
        >
          {t("addHabit.deleteHabit")}
        </button>
      )}
    </Modal>
  );
}
