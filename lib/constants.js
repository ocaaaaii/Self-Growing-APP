// Shared config used across the app

// 難易度 → 點數
export const DIFFICULTY = [
  { label: "簡單", points: 5 },
  { label: "中等", points: 15 },
  { label: "困難", points: 30 },
];

export const CATEGORIES = ["健康", "學習", "生活", "心靈", "不要做"];

export const FREQUENCIES = ["每日", "平日", "每週 3 次", "自由"];

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

// 感恩 card 上的提示語
export const GRATITUDE_QUOTES = [
  "練習看見生活裡的好，溫柔會慢慢回來",
  "再小的事，被記得就會發光",
  "今天有什麼，讓你嘴角微微上揚？",
  "感謝不用偉大，誠實就好",
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
  if (h < 5) return "還沒睡嗎？早點休息喔";
  if (h < 11) return "早安";
  if (h < 14) return "午安";
  if (h < 18) return "下午好";
  if (h < 22) return "晚上好";
  return "夜深了，記得照顧自己";
}

// 今天的日期字串（給 habit_logs 用，跟 SQL 的 current_date 對齊）
export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
