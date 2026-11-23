"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ENCOURAGEMENTS, todayStr } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import PointsCard from "./PointsCard";
import HabitCard from "./HabitCard";
import GratitudeCard from "./GratitudeCard";
import Modal, { CloseButton } from "./Modal";
import Icon from "./Icon";
import { categoryIcon, stripEmoji } from "@/lib/icons";
import { useConfirm } from "./ConfirmDialog";
import InstallBanner from "./InstallBanner";
import { useLocale } from "@/components/LocaleProvider";

// Lazy-load heavy modals — they're only needed when the user opens them
const CelebrateModal     = dynamic(() => import("./CelebrateModal"));
const AddHabitModal      = dynamic(() => import("./AddHabitModal"));
const ReflectionModal    = dynamic(() => import("./ReflectionModal"));
const ReflectionListModal= dynamic(() => import("./ReflectionListModal"));
const RestDayModal       = dynamic(() => import("./RestDayModal"));
const WeeklyReviewModal  = dynamic(() => import("./WeeklyReviewModal"));

// 判斷某個習慣今天是否應該顯示（client-side 版本，供新增/編輯後使用）
function shouldShowToday(habit) {
  const dayOfWeek = new Date().getDay();
  switch (habit.frequency) {
    case "每日":
      return true;
    case "平日":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "每週自訂":
    case "每週 3 次": // backward compat
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
  serverNow,
}) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLocale();

  // Clock for the greeting/date/late-night banner. The first render uses the
  // server's value (already in the user's time zone) so server and browser
  // HTML match; after mounting we switch to the browser clock.
  const [clock, setClock] = useState(() => serverNow || null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock({
        hour: d.getHours(),
        minute: d.getMinutes(),
        dateLabel: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  const frameRef = useRef(null);
  const [askConfirm, confirmDialog] = useConfirm();

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
  const [showDone, setShowDone] = useState(false);
  const [effects, setEffects] = useState([]);

  const [celebrate, setCelebrate] = useState(null); // {title,message,badge,mood}
  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [savingHabit, setSavingHabit] = useState(false);

  // gratitude
  const [gratitude, setGratitude] = useState(todayGratitude);
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [showGratHistory, setShowGratHistory] = useState(false);
  // Pick a random gratitude quote from i18n
  // (picked after mount: a random pick during render differs between the
  // server HTML and the browser and breaks hydration)
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * 4));
  }, []);
  const rawQuote = t(`gratitudeQuotes.${quoteIdx}`);
  // Fallback: if key not found yet, t() returns the key itself
  const quote = rawQuote.startsWith("gratitudeQuotes.")
    ? "練習看見生活裡的好，溫柔會慢慢回來"
    : rawQuote;

  // reflection — today
  const [showReflection, setShowReflection] = useState(false);
  const [showReflectionList, setShowReflectionList] = useState(false);
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
    // One AI line per day (and one more once everything is done), cached on
    // this device so reopening the app doesn't call the API again.
    const allDone = initialHabits.length > 0 && doneSet.size >= initialHabits.length;
    const cacheKey = `mochi-encourage:${username || ""}:${todayStr()}:${allDone ? 1 : 0}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAiMessage(cached);
        return;
      }
    } catch {}
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
        if (!cancelled && d?.message) {
          setAiMessage(d.message);
          try {
            localStorage.setItem(cacheKey, d.message);
          } catch {}
        }
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
                title: habit.title,
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
      alert(t("home.error_toggle") + (err?.message || ""));
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
          title: t("home.habitAdded_title"),
          message: shouldShowToday(data)
            ? `「${data.title}」${t("home.habitAdded_today")}`
            : `「${data.title}」${t("home.habitAdded_scheduled")}`,
          badge: t("home.habitAdded_badge"),
          mood: "loving",
        });
      }
      setShowAdd(false);
      setEditingHabit(null);
    } catch (err) {
      alert(t("home.error_save") + (err?.message || ""));
    } finally {
      setSavingHabit(false);
    }
  }

  async function handleDeleteHabit(habit) {
    const ok = await askConfirm({
      title: t("ui.deleteTitle", { title: habit.title }),
      body: t("ui.deleteHabitBody"),
      confirmLabel: t("ui.deleteHabit"),
    });
    if (!ok) return;
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
      alert(t("home.error_delete") + (err?.message || ""));
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
            title: t("gratitude.celebrate_title"),
            message: t("gratitude.celebrate_msg"),
            badge: row?.already_done ? t("gratitude.celebrate_badge_done") : t("gratitude.celebrate_badge_new"),
            mood: "loving",
          }),
        200
      );
      setTimeout(() => setMood("happy"), 4000);
    } catch (err) {
      alert(t("home.error_save") + (err?.message || ""));
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
            title: t("reflection.celebrate_title"),
            message: t("reflection.celebrate_msg"),
            badge: row?.already_done ? t("reflection.celebrate_badge_done") : t("reflection.celebrate_badge_new"),
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert(t("home.error_save") + (err?.message || ""));
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
            title: t("weeklyReview.celebrate_title"),
            message: t("weeklyReview.celebrate_msg"),
            badge: row?.already_done ? t("weeklyReview.celebrate_badge_done") : t("weeklyReview.celebrate_badge_new"),
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert(t("home.error_save") + (err?.message || ""));
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
            title: t("restDay.celebrate_title"),
            message: t("restDay.celebrate_msg"),
            badge: row?.already_done ? t("restDay.celebrate_badge_done") : t("restDay.celebrate_badge_new"),
            mood: "loving",
          }),
        200
      );
    } catch (err) {
      alert(t("home.error_save") + (err?.message || ""));
    } finally {
      setSavingRestDay(false);
    }
  }

  // 是否顯示今晚復盤提示條（23:55 後、有未做完、還沒復盤、不是休息日）
  const isLateNight = !!clock && clock.hour === 23 && clock.minute >= 55;
  const showReflectionBanner =
    isLateNight && incompleteHabits.length > 0 && !reflectionDone && !isRestDay && totalCount > 0;

  // 是否顯示昨天補復盤提示條
  const showYesterdayBanner =
    yesterdayNeedsReflection && !yesterdayReflectionDone;

  // ── today's list: open items grouped by category, finished ones tucked away ──
  const GROUP_ORDER = ["健康", "學習", "工作", "生活", "心靈", "不要做"];
  const groupRank = (k) => (GROUP_ORDER.includes(k) ? GROUP_ORDER.indexOf(k) : 99);
  const openHabits = habits.filter((h) => !doneSet.has(h.id));
  const doneHabits = habits.filter((h) => doneSet.has(h.id));
  const groups = [];
  for (const h of openHabits) {
    const key = GROUP_ORDER.includes(h.category) ? h.category : "其他";
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, items: [] }));
    g.items.push(h);
  }
  groups.sort((a, b) => groupRank(a.key) - groupRank(b.key));
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  // Mochi follows today's progress instead of always smiling.
  const greetingMood =
    totalCount === 0 || isRestDay
      ? "happy"
      : doneCount === 0
      ? "sleepy"
      : doneCount >= totalCount
      ? "loving"
      : "happy";

  const renderCard = (h) => (
    <HabitCard
      key={h.id}
      habit={h}
      done={doneSet.has(h.id)}
      busy={busyId === h.id}
      onToggle={(habit, ev) => toggleHabit(habit, ev)}
      onEdit={openEditHabit}
    />
  );

  const nudge = ({ icon, title, body, onClick }) => (
    <button
      key={title}
      type="button"
      onClick={onClick}
      className="mt-2.5 flex w-full items-center gap-3 rounded-[16px] border border-line/50 bg-cream-card/80 px-3.5 py-3 text-left transition hover:bg-cream-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-beige text-accent">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-cocoa-deep">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{body}</span>
      </span>
      <Icon name="chevronRight" size={18} className="text-muted" />
    </button>
  );

  const linkBtn =
    "-mr-2 flex min-h-[40px] items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted transition hover:bg-beige hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50";

  return (
    <div ref={frameRef} className="relative">
      <div className="px-5 pb-[132px] pt-2">
        {/* greeting */}
        <header className="mb-4 mt-1.5 flex items-end justify-between gap-3 pr-10">
          <div className="min-w-0">
            <div className="font-hand text-lg text-muted">
              {clock?.dateLabel ?? " "}
            </div>
            <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
              {(() => {
                const h = clock?.hour ?? 12;
                if (h < 5 || h >= 18) return t("home.greeting_evening");
                if (h < 11) return t("home.greeting_morning");
                return t("home.greeting_noon");
              })()}{" "}
              {username}
              <br />
              {t("home.tagline")}
            </h1>
          </div>
          <div className="flex-shrink-0 pb-1">
            <Mochi mood={greetingMood} size={52} />
          </div>
        </header>

        {/* points */}
        <PointsCard points={points} todayDelta={todayDelta} compact />

        {/* today's habits */}
        <section aria-labelledby="today-heading" className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="today-heading"
              className="flex items-center gap-1.5 text-base font-semibold text-cocoa-deep"
            >
              <Bow size={18} /> {t("home.todayHabits")}
            </h2>
            {isRestDay ? (
              <span className="text-xs font-medium text-muted">{t("home.restDay")}</span>
            ) : (
              <button type="button" onClick={() => setShowRestDay(true)} className={linkBtn}>
                <Icon name="sofa" size={15} />
                {t("home.restDayBtn")}
              </button>
            )}
          </div>

          {totalCount > 0 && (
            <div className="mt-1.5 flex items-center gap-3">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-milktea-soft/70"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-valuenow={doneCount}
                aria-label={t("home.todayHabits")}
              >
                <div
                  className="h-full rounded-full bg-cocoa transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-accent">
                {t("home.counter", { done: doneCount, total: totalCount })}
              </span>
            </div>
          )}

          {totalCount === 0 ? (
            <div className="mt-3 flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
              <Mochi mood="happy" size={84} />
              <p className="mt-3 text-sm font-medium text-cocoa-deep">{t("home.noHabits")}</p>
              <p className="mt-1 text-xs text-muted">{t("home.noHabitsRestHint")}</p>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="btn-cocoa mt-4 rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-soft"
              >
                {t("home.addHabitBtn")}
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-4">
              {groups.map((g) => (
                <div key={g.key}>
                  <h3 className="mb-1.5 flex items-center gap-1.5 pl-1 text-xs font-semibold text-muted">
                    <Icon name={categoryIcon(g.key)} size={14} />
                    {t(`categories.${g.key}`).startsWith("categories.") ? g.key : t(`categories.${g.key}`)}
                    <span className="font-normal">· {g.items.length}</span>
                  </h3>
                  <div className="flex flex-col gap-2">{g.items.map(renderCard)}</div>
                </div>
              ))}

              {openHabits.length === 0 && (
                <p className="rounded-[16px] bg-cream-card/70 px-4 py-3 text-center text-sm font-medium text-cocoa-deep">
                  {t("home.mochiAllDone")}
                </p>
              )}

              {doneHabits.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDone((v) => !v)}
                    aria-expanded={showDone}
                    className="flex min-h-[40px] w-full items-center gap-1.5 rounded-xl pl-1 text-left text-xs font-semibold text-muted transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cocoa/50"
                  >
                    <Icon name="check" size={14} />
                    {t("home.doneGroup", { n: doneHabits.length })}
                    <Icon
                      name="chevronDown"
                      size={14}
                      className={`transition-transform ${showDone ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showDone && (
                    <div className="mt-1 flex flex-col gap-2">{doneHabits.map(renderCard)}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* gentle nudges — after today's list, so the day opens on what's ahead */}
        <div className="mt-4">
          {showReflectionBanner &&
            nudge({
              icon: "moon",
              title: t("home.reflectionBannerTitle"),
              body: t("home.reflectionBannerBody", { n: incompleteHabits.length }),
              onClick: () => setShowReflection(true),
            })}
          {showYesterdayBanner &&
            nudge({
              icon: "moon",
              title: t("home.yesterdayBannerTitle"),
              body: t("home.yesterdayBannerBody", { n: yesterdayIncompleteHabits?.length }),
              onClick: () => setShowYesterdayReflection(true),
            })}
          {isSunday &&
            !weeklyReviewDoneState &&
            nudge({
              icon: "flower",
              title: t("home.weeklyReview"),
              body: t("home.weeklyReviewHint"),
              onClick: () => setShowWeeklyReview(true),
            })}
        </div>

        {/* reflection */}
        <section aria-labelledby="reflection-heading" className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <h2
              id="reflection-heading"
              className="flex items-center gap-1.5 text-base font-semibold text-cocoa-deep"
            >
              <Bow size={18} /> {t("home.reflectionSection")}
            </h2>
            <button type="button" onClick={() => setShowReflectionList(true)} className={linkBtn}>
              {t("home.viewReflection")}
            </button>
          </div>
          {reflectionDone ? (
            <p className="flex items-center gap-2 rounded-[14px] border border-line/40 bg-cream-card/60 px-3.5 py-2.5 text-xs text-muted">
              <Icon name="check" size={15} className="text-accent" /> {t("home.reflectionDone")}
            </p>
          ) : totalCount > 0 && !isRestDay ? (
            <p className="flex items-center gap-2 rounded-[14px] bg-beige/50 px-3.5 py-2.5 text-xs text-muted">
              <Icon name="moon" size={15} /> {t("home.reflectionReminder")}
            </p>
          ) : null}
        </section>

        {/* daily gratitude */}
        <section aria-labelledby="gratitude-heading" className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <h2
              id="gratitude-heading"
              className="flex items-center gap-1.5 text-base font-semibold text-cocoa-deep"
            >
              <Bow size={18} /> {t("home.gratitudeSection")}
            </h2>
            {gratitudeHistory.length > 0 && (
              <button type="button" onClick={() => setShowGratHistory(true)} className={linkBtn}>
                {t("home.gratitudeViewHistory")}
              </button>
            )}
          </div>
          <GratitudeCard
            quote={quote}
            todayEntry={gratitude}
            onSave={handleSaveGratitude}
            saving={savingGratitude}
          />
        </section>

        {/* Mochi's note — the page ends on Mochi */}
        <div
          className="relative mt-5 flex items-center gap-3.5 overflow-hidden rounded-xl2 p-4"
          style={{ background: "linear-gradient(135deg, rgb(var(--grad-mascot-from)) 0%, rgb(var(--grad-mascot-to)) 100%)" }}
        >
          <Mochi mood={mood === "happy" ? greetingMood : mood} size={60} />
          <div>
            <div className="font-hand text-base text-accent">{t("home.mochiSays")}</div>
            <p className="mt-0.5 text-sm font-medium leading-relaxed text-cocoa-deep">
              {aiMessage
                ? `「${stripEmoji(aiMessage)}」`
                : totalCount === 0
                ? `「${t("home.mochiEmpty")}」`
                : doneCount >= totalCount
                ? `「${t("home.mochiAllDone")}」`
                : doneCount === 0
                ? `「${t("home.mochiStart")}」`
                : `「${t("home.mochiRemaining", { n: totalCount - doneCount, done: doneCount })}」`}
            </p>
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
      <ReflectionListModal
        open={showReflectionList}
        onClose={() => setShowReflectionList(false)}
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
      <Modal open={showGratHistory} onClose={() => setShowGratHistory(false)} label={t("home.gratitudeHistoryTitle")}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
        <CloseButton onClick={() => setShowGratHistory(false)} />
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
          <Icon name="leaf" size={18} className="text-accent" /> {t("home.gratitudeHistoryTitle")}
        </h2>
        <p className="mb-[18px] text-xs text-muted">
          {t("home.gratitudeHistorySubtitle")}
        </p>
        <div className="flex flex-col gap-2.5">
          {gratitudeHistory.map((g) => (
            <div
              key={g.id}
              className="rounded-[14px] bg-cream-card px-3.5 py-3"
            >
              <div className="mb-1.5 font-hand text-base text-muted">
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

      {confirmDialog}

      {/* PWA install banner — shows once after first home visit */}
      <InstallBanner />
    </div>
  );
}
