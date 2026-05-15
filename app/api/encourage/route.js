import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/encourage
// Generates a personalised encouragement line from Mochi using the
// Anthropic API, based on the user's current progress.
// If no ANTHROPIC_API_KEY is set, returns { message: null } so the
// client gracefully falls back to its built-in messages.
export async function POST(request) {
  // must be logged in
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // no key configured — let the client use its own messages
    return NextResponse.json({ message: null });
  }

  let stats = {};
  try {
    stats = await request.json();
  } catch {
    stats = {};
  }
  const {
    username = "你",
    points = 0,
    doneToday = 0,
    totalToday = 0,
    longestStreak = 0,
  } = stats;

  const prompt = `你是「慢慢變好」這個溫柔成長 App 裡的小棕熊 mochi，個性溫暖、可愛、像個會撒嬌又會替人加油的小夥伴。
請根據使用者今天的狀態，給「一句」30 字以內的繁體中文鼓勵話。
語氣要溫柔、正向、有陪伴感；不要說教、不要製造壓力、不要提到數字細節。最多用 1 個 emoji。
直接輸出那句話就好，不要加引號或任何說明。

使用者暱稱：${username}
目前總點數：${points}
今天完成的小事：${doneToday} / ${totalToday}
最長連續天數：${longestStreak}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ message: null });
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim() || null;
    return NextResponse.json({ message: text });
  } catch {
    // network / API hiccup — fall back gracefully
    return NextResponse.json({ message: null });
  }
}
