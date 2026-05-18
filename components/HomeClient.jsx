"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { greetingFor, ENCOURAGEMENTS, GRATITUDE_QUOTES } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import PointsCard from "./PointsCard";
import HabitCard from "./HabitCard";
import CelebrateModal from "./CelebrateModal";
import AddHabitModal from "./AddHabitModal";
import GratitudeCard from "./GratitudeCard";
import ReflectionModal from "./ReflectionModal";
import RestDayModal from "./RestDayModal";
import WeeklyReviewModal from "./WeeklyReviewModal";
import Modal from "./Modal";

// 判斷某個習慣今天是否應該顯示（client-side 版本，供新增/編輯後使用）
function shouldShowToday(habit) {
  const dayOfWeek = new Date().getDay();
  switch (habit.frequency) {
    case "每日":
      return true;
    case "平日":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "每週 3 次":
      return (
        Array.isArray(habit.schedule_days) &&
        habit.schedule_days.length > 0 &&
        habit.schedule_days.includes(dayOfWeek)
      );
    case "自由":
      return false;
    default:
      return true;
  }
}

export default function HomeClient({
  initialPoints,
  username,
  habits: initialHabits,
  todayLogs,
  todayGratitude,
  gratitudeHistory,
  todayReflectionDone: initialReflectionDone,
  yesterdayNeedsReflection,
  yesterdayIncompleteHabits,
  yesterdayStr,
  todayIsRestDay: initialRestDay,
  isSunday,
  weekStart,
  weeklyReviewDone: initialWeeklyReviewDone,
}) {
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
  const [editingHabit, setEditingHabit] = useState(null);
  const [savingHabit, setSavingHabit] = useState(false);

  // gratitude
  const [gratitude, setGratitude] = useState(todayGratitude);
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [showGratHistory, setShowGratHistory] = useState(false);
  const [quote] = useState(
    () => GRATITUDE_QUOTES[Math.floor(Math.random() * GRATITUDE_QUOTES.length)]
  );

  // reflection — today
  const [showReflection, setShowReflection] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(initialReflectionDone);
  const reflectionShownRef = useRef(false);

  // reflection — yesterday
  const [showYesterdayReflection, setShowYesterdayReflection] = useState(false);
  const [yesterdayReflectionDone, setYesterdayReflectionDone] = useState(false);

  // rest day
  const [isRestDay, setIsRestDay] = useState(initialRestDay);
  const [showRestDay, setShowRestDay] = useState(false);
  const [savingRestDay, setSavingRestDay] = useState(false);

  // weekly review
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [savingWeeklyReview, setSavingWeeklyReview] = useState(false);
  const [weeklyReviewDoneState, setWeeklyReviewDoneState] = useState(initialWeeklyReviewDone);
  const weeklyReviewShownRef = useRef(false);

  // 只計今天應顯示習慣中已完成的數量
  const doneCount = habits.filter((h) => doneSet.has(h.id)).length;
  const totalCount = habits.length;
  const incompleteHabits = habits.filter((h) => !doneSet.has(h.id));

  // 週日 20:00 後若還沒做本週回顧 → 自動彈出一次
  useEffect(() => {
    if (weeklyReviewShownRef.current) return;
    if (!isSunday) return;
    if (weeklyReviewDoneState) return;
    if (new Date().getHours() < 20) return;

    const timer = setTimeout(() => {
      setShowWeeklyReview(true);
      weeklyReviewShownRef.current = true;
    }, 3000); // 比 reflection 晚一點，不要同時彈

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 晚上 23:55 後若有未完成習慣、且今天還沒復盤、且不是休息日 → 自動彈出一次
  useEffect(() => {
    if (reflectionShownRef.current) return;
    if (reflectionDone) return;
    if (isRestDay) return; // 休息日不彈
    if (totalCount === 0) return;

    const now = new Date();
    const isLateEnough = now.getHours() === 23 && now.getMinutes() >= 55;
    if (!isLateEnough) return;

    const incomplete = habits.filter((h) => !doneSet.has(h.id));
    if (incomplete.length === 0) return;

    const timer = setTimeout(() => {
      setShowReflection(true);
      reflectionShownRef.current = true;
    }, 1800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the shared FAB (in the app shell) fires this event → open in ADD mode
  useEffect(() => {
    const open = () => {
      setEditingHabit(null);
      setShowAdd(true);
    };
    window.addEventListener("app-fab", open);
    return () => window.removeEventListener("app-fab", open);
  }, []);

  function openEditHabit(habit) {
    setEditingHabit(habit);
    setShowAdd(true);
  }

  // AI encouragement from Mochi (via /api/encourage). Falls back silently.
  const [aiMessage, setAiMessage] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/encourage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username,
        points: initialPoints,
        doneToday: doneSet.size,
        totalToday: initialHabits.length,
        longestStreak: initialHabits.reduce(
          (m, h) => Math.max(m, h.streak || 0),
          0
        ),
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.message) setAiMessage(d.message);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleSaveHabit(form) {
    setSavingHabit(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (editingHabit) {
        const { data, error } = await supabase
          .from("habits")
          .update(form)
          .eq("id", editingHabit.id)
          .select()
          .single();
        if (error) throw error;

        // 頻率或排程改變後，判斷今天是否還應顯示
        if (shouldShowToday(data)) {
          setHabits((hs) => hs.map((h) => (h.id === editingHabit.id ? data : h)));
        } else {
          // 不該顯示了，從今日清單移除
          setHabits((hs) => hs.filter((h) => h.id !== editingHabit.id));
          setDoneSet((s) => {
            const next = new Set(s);
            next.delete(editingHabit.id);
            return next;
          });
        }
      } else {
        const { data, error } = await supabase
          .from("habits")
          .insert({ ...form, user_id: user.id })
          .select()
          .single();
        if (error) throw error;

        // 只有今天應顯示的習慣才加進清單
        if (shouldShowToday(data)) {
          setHabits((hs) => [...hs, data]);
        }

        setCelebrate({
          title: "加入啦！",
          message: shouldShowToday(data)
            ? `「${data.title}」會出現在你今天的小事裡 ✨`
            : `「${data.title}」已建立，會在設定的日子出現 🌱`,
          badge: "🌱 + 1 小事",
          mood: "loving",
        });
      }
      setShowAdd(false);
      setEditingHabit(null);
    } catch (err) {
      alert("沒能儲存，再試一次：" + (err?.message || ""));
    } finally {
      setSavingHabit(false);
    }
  }

  async function handleDeleteHabit(habit) {
    if (!confirm(`確定要刪除「${habit.title}」嗎？`)) return;
    setSavingHabit(true);
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habit.id);
      if (error) throw error;
      setHabits((hs) => hs.filter((h) => h.id !== habit.id));
      setDoneSet((s) => {
        const next = new Set(s);
        next.delete(habit.id);
        return next;
      });
      setShowAdd(false);
      setEditingHabit(null);
    } catch (err) {
      alert("沒能刪除，再試一次：" + (err?.message || ""));
    } finally {
      setSavingHabit(false);
    }
  }

  async function handleSaveGratitude(items) {
    setSavingGratitude(true);
    try {
      const { data, error } = await supabase.rpc("save_gratitude", {
        p_item_1: items[0].trim(),
        p_item_2: items[1].trim(),
        p_item_3: items[2].trim(),
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;

      setGratitude({
        item_1: items[0].trim(),
        item_2: items[1].trim(),
        item_3: items[2].trim(),
      });
      if (!row?.already_done) {
        setPoints(row?.new_total ?? points + 20);
        setTodayDelta((d) => d + 20);
      }
      setMood("loving");
      setTimeout(
        () =>
          setCelebrate({
            title: "感恩已記下 🌿",
            message:
              "mochi 也覺得今天很值得被記得。願你的心也輕輕的。",
            badge: row?.already_done ? "🌿 今天已記過" : "+20 pt",
            mood: "loving",
          }),
        200
      );
      setTimeout(() => setMood("happy"), 4000);
    } catch (err) {
      alert("沒能記下來，再試一次：" + (err?.message || ""));
    } finally {
      setSavingGratitude(false);
    }
  }

  // entryDate: 'today'（預設）or yesterdayStr（補昨天）
  async function handleSaveReflection(text, entryDate) {
    setSavingReflection(true);
    const isYesterday = !!entryDate && entryDate !== undefined;
    try {
      const rpcArgs = { p_reflection: text };
      if (isYesterday) rpcArgs.p_entry_date = entryDate;

      const { data, error } = await supabase.rpc("save_reflection", rpcArgs);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;

      if (!row?.already_done) {
        setPoints(row?.new_total ?? points + 10);
        setTodayDelta((d) => d + 10);
      }

      if (isYesterday) {
        setYesterdayReflectionDone(true);
        setShowYesterdayReflection(false);
      } else {
        setReflectionDone(true);
        setShowReflection(false);
      }

      setTimeout(
        () =>
          setCelebrate({
            title: "謝謝你的誠實 🌿",
            message: "對自己 100% 誠實，需要很大的勇氣。mochi 很敬佩你。",
            badge: row?.already_done ? "🌿 已復盤過" : "+10 pt",
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert("沒能記下來，再試一次：" + (err?.message || ""));
    } finally {
      setSavingReflection(false);
    }
  }

  async function handleSaveWeeklyReview(proudMoment) {
    setSavingWeeklyReview(true);
    try {
      const { data, error } = await supabase.rpc("save_weekly_review", {
        p_week_start: weekStart,
        p_proud_moment: proudMoment,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.already_done) {
        setPoints(row?.new_total ?? points + 15);
        setTodayDelta((d) => d + 15);
      }
      setWeeklyReviewDoneState(true);
      setShowWeeklyReview(false);
      setTimeout(
        () =>
          setCelebrate({
            title: "本週回顧完成 🌸",
            message: "看見自己的成長，本身就是一種力量。下週繼續加油 🌱",
            badge: row?.already_done ? "🌸 本週已回顧" : "+15 pt",
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert("沒能儲存，再試一次：" + (err?.message || ""));
    } finally {
      setSavingWeeklyReview(false);
    }
  }

  async function handleSaveRestDay(reason) {
    setSavingRestDay(true);
    try {
      const { data, error } = await supabase.rpc("save_rest_day", {
        p_reason: reason,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.already_done) {
        setPoints(row?.new_total ?? points + 5);
        setTodayDelta((d) => d + 5);
      }
      setIsRestDay(true);
      setShowRestDay(false);
      setTimeout(
        () =>
          setCelebrate({
            title: "好好休息 🛁",
            message: "今天的請假已記下。休息也是照顧自己的一部分。",
            badge: row?.already_done ? "🛁 今天已請假" : "+5 pt",
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert("沒能記下來，再試一次：" + (err?.message || ""));
    } finally {
      setSavingRestDay(false);
    }
  }

  // 是否顯示今晚復盤提示條（23:55 後、有未做完、還沒復盤、不是休息日）
  const now = new Date();
  const isLateNight = now.getHours() === 23 && now.getMinutes() >= 55;
  const showReflectionBanner =
    isLateNight && incompleteHabits.length > 0 && !reflectionDone && !isRestDay && totalCount > 0;

  // 是否顯示昨天補復盤提示條
  const showYesterdayBanner =
    yesterdayNeedsReflection && !yesterdayReflectionDone;

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

        {/* 本週回顧提示條（週日才顯示）*/}
        {isSunday && !weeklyReviewDoneState && (
          <button
            onClick={() => setShowWeeklyReview(true)}
            className="mt-4 w-full rounded-[14px] border border-sage/40 bg-sage/10 px-4 py-3 text-left shadow-soft transition hover:-translate-y-px"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-cocoa-deep">
                  🌸 本週回顧
                </p>
                <p className="mt-0.5 text-[11px] text-milktea">
                  看看這週的進步，寫下最驕傲的事 +15pt
                </p>
              </div>
              <span className="text-cocoa-soft">→</span>
            </div>
          </button>
        )}

        {/* 昨天補復盤提示條 */}
        {showYesterdayBanner && (
          <button
            onClick={() => setShowYesterdayReflection(true)}
            className="mt-4 w-full rounded-[14px] border border-milktea/30 bg-beige/80 px-4 py-3 text-left shadow-soft transition hover:-translate-y-px"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-cocoa-deep">
                  🌙 昨天的復盤還沒做
                </p>
                <p className="mt-0.5 text-[11px] text-milktea">
                  昨天有 {yesterdayIncompleteHabits?.length} 件沒完成，補一下也不晚 +10pt
                </p>
              </div>
              <span className="text-cocoa-soft">→</span>
            </div>
          </button>
        )}

        {/* today's habits */}
        <div className="mb-3 mt-[22px] flex items-baseline justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
            <Bow size={18} /> 今天的小事
            <span className="font-hand text-lg text-cocoa-soft">today</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* 休息日按鈕 */}
            {isRestDay ? (
              <span className="text-xs text-milktea">🛁 今天請假</span>
            ) : (
              <button
                onClick={() => setShowRestDay(true)}
                className="text-xs text-milktea underline-offset-2 hover:underline"
              >
                今天請假
              </button>
            )}
            <span className="text-xs text-milktea">
              {doneCount} / {totalCount} 完成
            </span>
          </div>
        </div>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
            <Mochi mood="happy" size={84} />
            <p className="mt-3 text-sm font-medium text-cocoa-deep">
              今天沒有排定的小事
            </p>
            <p className="mt-1 text-xs text-milktea">
              休息也很重要 🛁 要不要建立新的習慣？
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-semibold text-cream-card shadow-soft"
              style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
            >
              建立新習慣 ✨
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
                onEdit={openEditHabit}
              />
            ))}
          </div>
        )}

        {/* 晚間復盤提示條 */}
        {showReflectionBanner && (
          <button
            onClick={() => setShowReflection(true)}
            className="mt-3 w-full rounded-[14px] border border-line/60 bg-cream-card/80 px-4 py-3 text-left shadow-soft transition hover:-translate-y-px"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-cocoa-deep">
                  🌙 今日復盤
                </p>
                <p className="mt-0.5 text-[11px] text-milktea">
                  有 {incompleteHabits.length} 件沒完成，對自己誠實一下 +10pt
                </p>
              </div>
              <span className="text-cocoa-soft">→</span>
            </div>
          </button>
        )}

        {/* daily gratitude */}
        <div className="mb-3 mt-[22px] flex items-baseline justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-cocoa-deep">
            <Bow size={18} /> 感恩三件事
            <span className="font-hand text-lg text-cocoa-soft">gratitude</span>
          </h2>
          {gratitudeHistory.length > 0 && (
            <button
              onClick={() => setShowGratHistory(true)}
              className="text-xs text-milktea"
            >
              回顧 →
            </button>
          )}
        </div>
        <GratitudeCard
          quote={quote}
          todayEntry={gratitude}
          onSave={handleSaveGratitude}
          saving={savingGratitude}
        />

        {/* mascot card */}
        <div
          className="relative mt-3.5 flex items-center gap-3.5 overflow-hidden rounded-xl2 p-4 shadow-soft"
          style={{ background: "linear-gradient(135deg, rgb(var(--grad-mascot-from)) 0%, rgb(var(--grad-mascot-to)) 100%)" }}
        >
          <div className="animate-floaty">
            <Mochi mood={mood} size={64} />
          </div>
          <div>
            <div className="font-hand text-sm text-cocoa">mochi 想跟你說 ✨</div>
            <div className="mt-0.5 text-[13px] font-medium leading-relaxed text-cocoa-deep">
              {aiMessage
                ? `「${aiMessage}」`
                : totalCount === 0
                ? "「今天是你的自由日，好好休息 🛁」"
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

      {/* modals */}
      <AddHabitModal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        habit={editingHabit}
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
      <WeeklyReviewModal
        open={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        onSave={handleSaveWeeklyReview}
        saving={savingWeeklyReview}
        weekStart={weekStart}
      />
      <RestDayModal
        open={showRestDay}
        onClose={() => setShowRestDay(false)}
        onSave={handleSaveRestDay}
        saving={savingRestDay}
      />
      <ReflectionModal
        open={showReflection}
        onClose={() => setShowReflection(false)}
        onSave={(text) => handleSaveReflection(text)}
        saving={savingReflection}
        incompleteHabits={incompleteHabits}
        isYesterday={false}
      />
      <ReflectionModal
        open={showYesterdayReflection}
        onClose={() => setShowYesterdayReflection(false)}
        onSave={(text) => handleSaveReflection(text, yesterdayStr)}
        saving={savingReflection}
        incompleteHabits={yesterdayIncompleteHabits}
        isYesterday={true}
      />

      {/* gratitude history */}
      <Modal open={showGratHistory} onClose={() => setShowGratHistory(false)}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
        <button
          onClick={() => setShowGratHistory(false)}
          className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
        >
          ✕
        </button>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
          <span className="text-lg">🌿</span> 感恩回顧
        </h2>
        <p className="mb-[18px] text-xs text-milktea">
          過去那些值得被看見的小事
        </p>
        <div className="flex flex-col gap-2.5">
          {gratitudeHistory.map((g) => (
            <div
              key={g.id}
              className="rounded-[14px] border-l-[3px] border-sage bg-cream-card px-3.5 py-3"
            >
              <div className="mb-1.5 font-hand text-base text-cocoa-soft">
                {new Date(g.entry_date).toLocaleDateString("zh-TW", {
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {[g.item_1, g.item_2, g.item_3].map((item, i) => (
                <div
                  key={i}
                  className="relative pl-3.5 text-[13px] leading-relaxed text-cocoa-deep before:absolute before:left-1 before:font-bold before:text-sage before:content-['·']"
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
