"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { greetingFor, ENCOURAGEMENTS } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import PointsCard from "./PointsCard";
import HabitCard from "./HabitCard";
import CelebrateModal from "./CelebrateModal";
import AddHabitModal from "./AddHabitModal";
import Fab from "./Fab";

export default function HomeClient({ initialPoints, username, habits: initialHabits, todayLogs }) {
  const router = useRouter();
  const supabase = createClient();
  const frameRef = useRef(null);

  const [points, setPoints] = useState(initialPoints);
  const [habits, setHabits] = useState(initialHabits);
  const [doneSet, setDoneSet] = useState(
    () => new Set(todayLogs.map((l) => l.habit_id))
  );
  const [todayDelta, setTodayDelta] = useState(
    () => todayLogs.reduce((s, l) => s + l.points_earned, 0)
  );
  const [mood, setMood] = useState("happy");
  const [busyId, setBusyId] = useState(null);
  const [effects, setEffects] = useState([]);

  const [celebrate, setCelebrate] = useState(null); // {title,message,badge,mood}
  const [showAdd, setShowAdd] = useState(false);
  const [savingHabit, setSavingHabit] = useState(false);

  const doneCount = doneSet.size;
  const totalCount = habits.length;

  // floating "+N pt" popup near a clicked card
  function flyPoints(el, n) {
    if (!el || !frameRef.current) return;
    const r = el.getBoundingClientRect();
    const f = frameRef.current.getBoundingClientRect();
    const id = Math.random();
    const fx = {
      id,
      text: `+${n} pt`,
      left: r.right - f.left - 64,
      top: r.top - f.top + 6,
    };
    setEffects((e) => [...e, fx]);
    setTimeout(() => setEffects((e) => e.filter((x) => x.id !== id)), 1200);
  }

  async function toggleHabit(habit, ev) {
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
        setPoints(row?.new_total ?? points + earned);
        setTodayDelta((d) => d + earned);
        setHabits((hs) =>
          hs.map((h) =>
            h.id === habit.id ? { ...h, streak: row?.new_streak ?? h.streak } : h
          )
        );

        // cute feedback
        const cardEl = ev?.currentTarget;
        flyPoints(cardEl, earned);
        setMood("cheer");
        setTimeout(() => setMood("happy"), 1500);

        if (habit.point_value >= 15) {
          const msg =
            ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
          setTimeout(
            () =>
              setCelebrate({
                title: `${habit.title} ✓`,
                message: msg,
                badge: `+${earned} pt`,
                mood: "loving",
              }),
            350
          );
        }
      } else {
        const { data, error } = await supabase.rpc("undo_habit_log", {
          p_habit_id: habit.id,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;

        const next = new Set(doneSet);
        next.delete(habit.id);
        setDoneSet(next);
        setPoints(row?.new_total ?? Math.max(points - habit.point_value, 0));
        setTodayDelta((d) => Math.max(d - habit.point_value, 0));
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
        message: `「${data.title}」會出現在你今天的小事裡 ✨`,
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
    <div ref={frameRef} className="relative">
      <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
        {/* greeting */}
        <div className="mb-[18px] mt-1.5">
          <div className="font-hand text-lg text-milktea">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
            {greetingFor()} {username}
            <span className="ml-1.5 inline-block animate-peek align-middle">
              <Mochi mood="happy" size={30} />
            </span>
            <br />
            今天也<span className="underline-cute">慢慢來</span> 🌱
          </h1>
        </div>

        {/* points */}
        <PointsCard points={points} todayDelta={todayDelta} />

        {/* today's habits */}
        <div className="mb-3 mt-[22px] flex items-baseline justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
            <Bow size={18} /> 今天的小事
            <span className="font-hand text-lg text-cocoa-soft">today</span>
          </h2>
          <span className="text-xs text-milktea">
            {doneCount} / {totalCount} 完成
          </span>
        </div>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
            <Mochi mood="happy" size={84} />
            <p className="mt-3 text-sm font-medium text-cocoa-deep">
              還沒有任何小事
            </p>
            <p className="mt-1 text-xs text-milktea">
              要不要跟 mochi 一起，建立第一個習慣？
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-semibold text-cream-card shadow-soft"
              style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
            >
              建立第一個小事 ✨
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                done={doneSet.has(h.id)}
                busy={busyId === h.id}
                onToggle={(habit, ev) => toggleHabit(habit, ev)}
              />
            ))}
          </div>
        )}

        {/* mascot card */}
        <div
          className="relative mt-3.5 flex items-center gap-3.5 overflow-hidden rounded-xl2 p-4 shadow-soft"
          style={{ background: "linear-gradient(135deg,#F4D5BC 0%,#E8BFA0 100%)" }}
        >
          <div className="animate-floaty">
            <Mochi mood={mood} size={64} />
          </div>
          <div>
            <div className="font-hand text-sm text-cocoa">mochi 想跟你說 ✨</div>
            <div className="mt-0.5 text-[13px] font-medium leading-relaxed text-cocoa-deep">
              {totalCount === 0
                ? "「我們慢慢開始就好，不用急～」"
                : doneCount >= totalCount
                ? "「今天的小事全部完成了！你好棒好棒 🎀」"
                : `「再做 ${totalCount - doneCount} 件就達成今日目標啦～你超棒的！」`}
            </div>
          </div>
        </div>
      </div>

      {/* floating point popups */}
      {effects.map((fx) => (
        <div
          key={fx.id}
          className="points-popup"
          style={{ left: fx.left, top: fx.top }}
        >
          {fx.text}
        </div>
      ))}

      {/* FAB + modals */}
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
