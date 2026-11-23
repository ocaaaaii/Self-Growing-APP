// Emoji → line-icon mapping.
// Habits and rewards still store an emoji in the database (`emoji` column) so
// existing data keeps working; the UI renders the matching line icon instead.
// The pickers offer icons but save the same emoji keys.

const EMOJI_ICON = {
  // health / body
  "🌱": "sprout", "💧": "droplet", "🏃‍♀️": "run", "🏃": "run", "💪": "dumbbell",
  "🥗": "bowl", "🧘‍♀️": "lotus", "🧘": "lotus", "🚴‍♀️": "bike", "🚴": "bike",
  "🏋️": "dumbbell", "🤸": "stretch", "🧖‍♀️": "bath", "🥤": "cup", "😴": "bed",
  // learning / work
  "📚": "books", "✏️": "pencil", "📔": "notebook", "💻": "laptop", "🎯": "target",
  "📝": "note", "🔬": "flask", "🎓": "cap", "🗒️": "list", "📖": "bookOpen",
  // life / mind
  "🌅": "sunrise", "🌙": "moon", "🪷": "lotus", "🌸": "flower", "🌿": "leaf",
  "☀️": "sun", "🧹": "broom", "🪴": "plant", "🎨": "palette", "🎵": "music",
  "📷": "camera", "🙏": "hands", "💊": "leaf",
  // don't
  "🚫": "ban", "📵": "phoneOff", "🍬": "candy", "🍟": "ban", "🍷": "wine", "🎰": "dice",
  // rewards — treats
  "☕": "coffee", "🧋": "cup", "🍰": "cake", "🍩": "cake", "🍫": "candy", "🍣": "bowl",
  "🍜": "bowl", "🧃": "cup", "🍦": "icecream", "🥐": "cake", "🍱": "bowl",
  // rewards — things
  "👗": "shirt", "👟": "bag", "💄": "sparkle", "💍": "gem", "🛍️": "bag", "📕": "bookOpen",
  "🎧": "headphones", "🕯️": "flame", "🎒": "bag",
  // rewards — experiences
  "🎬": "film", "🎮": "gamepad", "🎡": "ticket", "🏖️": "sun", "✈️": "plane", "🎭": "ticket",
  "💆": "lotus", "🛁": "bath", "🌏": "globe", "🎪": "ticket", "🎑": "moon",
  // rewards — big
  "🎀": "gift", "🌟": "star", "🏆": "trophy", "💝": "gift", "🥂": "glass", "🎁": "gift",
  // misc
  "🔥": "flame", "✨": "sparkle", "🏗️": "list", "👑": "trophy", "🌷": "flower", "🌳": "plant", "⭐": "star", "💭": "sparkle", "🏠": "home", "📱": "phoneOff", "⏰": "clock",
};

const CATEGORY_ICON = {
  健康: "leaf",
  學習: "bookOpen",
  工作: "laptop",
  生活: "home",
  心靈: "lotus",
  不要做: "ban",
};

// strip variation selectors so "☀" and "☀️" match
const VS16 = String.fromCharCode(0xfe0f);
const norm = (s) => (s || "").split(VS16).join("");
const NORM_MAP = Object.fromEntries(
  Object.entries(EMOJI_ICON).map(([k, v]) => [norm(k), v])
);

export function iconFor(emoji, category) {
  return NORM_MAP[norm(emoji)] || CATEGORY_ICON[category] || "sparkle";
}

export function categoryIcon(category) {
  return CATEGORY_ICON[category] || "sparkle";
}

// Remove decorative emoji from a UI string (keeps CJK and punctuation).
// (© ® ™ are "pictographic" in Unicode but are text here, so they are kept.)
const EMOJI_RE = new RegExp(
  "(?:(?![\\u00A9\\u00AE\\u2122])\\p{Extended_Pictographic}|\\p{Regional_Indicator})" +
    "(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*\\uFE0F?",
  "gu"
);
export function stripEmoji(s) {
  if (typeof s !== "string") return s;
  return s.replace(EMOJI_RE, "").replace(/[ \t]{2,}/g, " ").replace(/^\s+|\s+$/g, "");
}

// "🌅 早晨流程" → { icon: "sunrise", label: "早晨流程" }
export function splitEmojiLabel(s) {
  const m = (s || "").match(/^(\S+)\s+(.*)$/u);
  if (m && /\p{Extended_Pictographic}/u.test(m[1])) {
    return { icon: iconFor(m[1]), label: m[2] };
  }
  return { icon: "sparkle", label: stripEmoji(s) };
}

// Picker list without look-alikes: keep the first emoji for each icon.
export function uniqueIconChoices(list) {
  const seen = new Set();
  return list.filter((e) => {
    const name = iconFor(e);
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
}
