// Supported locales
export const LOCALES = [
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "简体中文", flag: "🇨🇳" },
  { code: "en",    label: "English",  flag: "🇺🇸" },
  { code: "ja",    label: "日本語",    flag: "🇯🇵" },
  { code: "ko",    label: "한국어",    flag: "🇰🇷" },
  { code: "es",    label: "Español",  flag: "🇪🇸" },
  { code: "pt",    label: "Português",flag: "🇧🇷" },
];

export const DEFAULT_LOCALE = "zh-TW";

// Load messages for a locale (server-side safe)
export async function loadMessages(locale) {
  const supported = LOCALES.map((l) => l.code);
  const safe = supported.includes(locale) ? locale : DEFAULT_LOCALE;
  try {
    const msgs = await import(`./messages/${safe}.json`);
    return msgs.default ?? msgs;
  } catch {
    const msgs = await import(`./messages/${DEFAULT_LOCALE}.json`);
    return msgs.default ?? msgs;
  }
}

// Simple dot-notation getter: t("nav.home") → "首頁"
export function getMessage(messages, key, vars) {
  const parts = key.split(".");
  let val = messages;
  for (const p of parts) {
    if (val == null) return key;
    val = val[p];
  }
  if (typeof val !== "string") return key;
  if (!vars) return val;
  // Replace {varName} placeholders
  return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}
