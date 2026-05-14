"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, ENCOURAGEMENTS } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import HabitCard from "./HabitCard";
import CelebrateModal from "./CelebrateModal";
import AddHabitModal from "./AddHabitModal";
import Fab from "./Fab";

const FILTERS = ["全部", ...CATEGORIES];

export default function HabitsClient({ habits: initialHabits, todayLogs }) {
  const router = useRouter();
  const supabase = createClient();

  const [habits, setHabits] = useState(initialHabits);
  const [doneSet, setDoneSet] = useState(
    () => new Set(todayLogs.map((l) => l.habit_id))
  );
  const [filter, setFilter] = useState("全部");
  const [busyId, setBusyId] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [savingHabit, setSavingHabit] = useState(false);

  const shown =
    filter === "全部" ? habits : habits.filter((h) => h.category === filter);

  async function toggleHabit(habit) {
    if (busyId) return;
    const isDone = doneSet.has(habit.id);
    setBusyId(habit.id);
    try {
      if (!isDone) {
        const { data, error } = await supabase.rpc("award_habit_points", {
          p_habit_id: habit.id,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        const earned = row?.points_earned ?? habit.point_value;

        setDoneSet((s) => new Set(s).add(habit.id));
        setHabits((hs) =>
          hs.map((h) =>
            h.id === habit.id ? { ...h, streak: row?.new_streak ?? h.streak } : h
          )
        );

        if (habit.point_value >= 15) {
          const msg =
            ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
          setCelebrate({
            title: `${habit.title} ✓`,
            message: msg,
            badge: `+${earned} pt`,
            mood: "loving",
          });
        }
      } else {
        const { error } = await supabase.rpc("undo_habit_log", {
          p_habit_id: habit.id,
        });
        if (error) throw error;
        const next = new Set(doneSet);
        next.delete(habit.id);
        setDoneSet(next);
        setHabits((hs) =>
          hs.map((h) =>
            h.id === habit.id
              ? { ...h, streak: Math.max(h.streak - 1, 0) }
              : h
          )
        );
      }
    } catch (err) {
      alert("有點小狀況，再試一次看看：" + (err?.message || ""));
    } finally {
      setBusyId(null);
    }
  }

  async function handleAddHabit(form) {
    setSavingHabit(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("habits")
        .insert({ ...form, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setHabits((hs) => [...hs, data]);
      setShowAdd(false);
      setCelebrate({
        title: "加入啦！",
        message: `「${data.title}」已經放進你的習慣清單 ✨`,
        badge: "🌱 + 1 小事",
        mood: "loving",
      });
    } catch (err) {
      alert("沒能加進去，再試一次：" + (err?.message || ""));
    } finally {
      setSavingHabit(false);
    }
  }

  return (
    <div className="relative">
      <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
        {/* header */}
        <div className="mb-[18px] mt-1.5 flex items-start justify-between">
          <div>
            <div className="font-hand text-lg text-milktea">my habits</div>
            <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
              所有的<span className="underline-cute">小小堅持</span> ✨
            </h1>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-line bg-cream-card px-2.5 py-1.5 text-[11px] font-medium text-milktea"
            >
              登出
            </button>
          </form>
        </div>

        {/* category filter */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-2xl border px-3.5 py-[7px] text-xs font-medium transition ${
                filter === f
                  ? "border-cocoa bg-cocoa text-cream-card"
                  : "border-line bg-cream-card text-cocoa"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* list */}
        {habits.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
            <Mochi mood="happy" size={84} />
            <p className="mt-3 text-sm font-medium text-cocoa-deep">
              還沒有任何習慣
            </p>
            <p className="mt-1 text-xs text-milktea">
              點右下角的 + 建立第一個吧
            </p>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center text-sm text-milktea shadow-soft">
            這個分類還沒有習慣～
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {shown.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                done={doneSet.has(h.id)}
                busy={busyId === h.id}
                onToggle={toggleHabit}
              />
            ))}
          </div>
        )}

        {/* gentle footer note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
          <Bow size={14} /> 你不是被逼著成長，是慢慢把自己養成喜歡的樣子
        </div>
      </div>

      <Fab onClick={() => setShowAdd(true)} />
      <AddHabitModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAddHabit}
        saving={savingHabit}
      />
      <CelebrateModal
        open={!!celebrate}
        onClose={() => {
          setCelebrate(null);
          router.refresh();
        }}
        title={celebrate?.title}
        message={celebrate?.message}
        badge={celebrate?.badge}
        mood={celebrate?.mood}
      />
    </div>
  );
}
