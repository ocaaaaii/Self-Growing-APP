// Shared config used across the app

// 難易度 → 點數
export const DIFFICULTY = [
  { label: "簡單", points: 5 },
  { label: "中等", points: 15 },
  { label: "困難", points: 30 },
];

export const CATEGORIES = ["健康", "學習", "生活", "心靈", "不要做"];

export const FREQUENCIES = ["每日", "平日", "每週自訂", "自由"];

export const EMOJI_CHOICES = [
  "🌱", "💧", "📚", "🏃‍♀️", "🧘‍♀️", "📔",
  "🌙", "🌅", "🪷", "💪", "🥗", "✏️",
];

// 獎勵
export const REWARD_CATEGORIES = ["小確幸", "物品", "體驗", "大獎勵"];

export const REWARD_EMOJI_CHOICES = [
  "☕", "🍰", "🧋", "💄", "👗", "🎮",
  "🎬", "📕", "🛍️", "🍱", "🛁", "🎧",
];

// If→Then 分類
export const IFTHEN_CATEGORIES = [
  "🌅 早晨流程",
  "🏠 回家流程",
  "📱 數位戒斷",
  "💭 情緒對應",
  "🎯 專注獎勵",
  "🌙 睡前流程",
];

// 主題
// bg = cream-card, accent = cocoa-deep（用於標籤文字和選中邊框）, cheek = 主題腮紅色
export const THEMES = [
  { key: "oat",     label: "奶茶", emoji: "🥛", bg: "rgb(250,244,232)", accent: "rgb(92,67,50)",    cheek: "rgb(226,168,160)" },
  { key: "mint",    label: "薄荷", emoji: "🌿", bg: "rgb(246,250,244)", accent: "rgb(58,80,58)",    cheek: "rgb(160,188,162)" },
  { key: "sakura",  label: "櫻花", emoji: "🌸", bg: "rgb(253,246,248)", accent: "rgb(116,64,76)",   cheek: "rgb(230,150,162)" },
  { key: "night",   label: "夜貓", emoji: "🌙", bg: "rgb(62,56,50)",    accent: "rgb(240,230,218)", cheek: "rgb(226,168,160)" },
  { key: "deep",    label: "深海", emoji: "🌊", bg: "rgb(236,242,250)", accent: "rgb(38,62,92)",    cheek: "rgb(148,185,214)" },
  { key: "carbon",  label: "碳黑", emoji: "⚡", bg: "rgb(50,53,60)",    accent: "rgb(222,226,234)", cheek: "rgb(148,168,196)" },
  { key: "forest",  label: "森林", emoji: "🌲", bg: "rgb(236,246,234)", accent: "rgb(36,62,40)",    cheek: "rgb(165,142,108)" },
  { key: "sunrise", label: "暖陽", emoji: "🌅", bg: "rgb(255,248,232)", accent: "rgb(128,76,32)",   cheek: "rgb(236,158,100)" },
];

// 感恩 card 上的提示語
export const GRATITUDE_QUOTES = [
  "練習看見生活裡的好，溫柔會慢慢回來",
  "再小的事，被記得就會發光",
  "今天有什麼，讓你嘴角微微上揚？",
  "感謝不用偉大，誠實就好",
];

// 成就徽章 — 從現有資料計算解鎖狀態
// stats: { totalPoints, longestStreak, growthDays, habitCount,
//          gratitudeCount, redeemCount }
export const ACHIEVEMENTS = [
  {
    key: "first_step",
    emoji: "🌱",
    title: "第一步",
    desc: "完成你的第一個習慣",
    check: (s) => s.growthDays >= 1,
  },
  {
    key: "architect",
    emoji: "🏗️",
    title: "習慣建築師",
    desc: "建立 5 個習慣",
    check: (s) => s.habitCount >= 5,
  },
  {
    key: "week_streak",
    emoji: "🔥",
    title: "一週不斷",
    desc: "連續打卡 7 天",
    check: (s) => s.longestStreak >= 7,
  },
  {
    key: "fortnight",
    emoji: "💪",
    title: "半月堅持",
    desc: "連續打卡 14 天",
    check: (s) => s.longestStreak >= 14,
  },
  {
    key: "points_100",
    emoji: "⭐",
    title: "點數新手",
    desc: "累積 100 點",
    check: (s) => s.totalPoints >= 100,
  },
  {
    key: "points_500",
    emoji: "🌟",
    title: "點數達人",
    desc: "累積 500 點",
    check: (s) => s.totalPoints >= 500,
  },
  {
    key: "points_1000",
    emoji: "👑",
    title: "點數大師",
    desc: "累積 1000 點",
    check: (s) => s.totalPoints >= 1000,
  },
  {
    key: "grow_7",
    emoji: "🌷",
    title: "成長一週",
    desc: "累積成長 7 天",
    check: (s) => s.growthDays >= 7,
  },
  {
    key: "grow_30",
    emoji: "🌳",
    title: "成長一個月",
    desc: "累積成長 30 天",
    check: (s) => s.growthDays >= 30,
  },
  {
    key: "grateful",
    emoji: "🙏",
    title: "感恩之心",
    desc: "記錄 7 次感恩",
    check: (s) => s.gratitudeCount >= 7,
  },
  {
    key: "self_love",
    emoji: "🎀",
    title: "寵愛自己",
    desc: "兌換你的第一個獎勵",
    check: (s) => s.redeemCount >= 1,
  },
];

// Mochi 在不同情境說的鼓勵話
export const ENCOURAGEMENTS = [
  "你今天又往前走了一小步 ✨",
  "超棒！這就是慢慢變好的證據",
  "紀律不是壓力，是禮物 🎀",
  "mochi 看到你了，超為你驕傲",
  "一點點就好，你已經做得很好了",
];

// 首頁問候語（依時間）
export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "晚安";
  if (h < 11) return "早安";
  if (h < 14) return "午安";
  if (h < 18) return "午安";
  return "晚安";
}

// 今天的日期字串（給 habit_logs 用，跟 SQL 的 current_date 對齊）
export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
