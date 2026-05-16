import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/reward-comment
// Body: { photoUrl, rewardTitle, note }
// Uses Claude vision to look at the redemption photo and write a short,
// warm comment from Mochi based on the reward + photo content.
// Falls back to a generic line if no ANTHROPIC_API_KEY is configured.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { photoUrl, rewardTitle = "獎勵", note = "" } = body;

  // No key OR no photo → return a sweet generic line so the UX still works
  if (!apiKey || !photoUrl) {
    return NextResponse.json({
      comment: `「${rewardTitle}」看起來很棒！你值得這份開心 🎀`,
      fallback: true,
    });
  }

  const prompt = `你是「慢慢變好」這個溫柔成長 App 裡的小棕熊 mochi，個性溫暖、可愛、像個會替朋友開心的小夥伴。

使用者剛剛用累積的點數兌換了一個獎勵 ——「${rewardTitle}」，然後拍了這張照片給你看${
    note ? `（他還寫了：「${note}」）` : ""
  }。

請看著照片裡的內容，給「一句」30 字以內的繁體中文回應。
語氣要：像看到朋友開心時你也跟著開心、會分享一個小小的想法或具體稱讚（例如食物看起來好吃、衣服很適合、地方很美等），帶一點撒嬌或共鳴。
不要說教、不要重複「你值得」這種話、不要列舉、最多 1 個 emoji。
直接輸出那句話就好，不要加引號或說明。`;

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
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url: photoUrl },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        comment: `「${rewardTitle}」看起來很棒！你值得這份開心 🎀`,
        fallback: true,
      });
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim() || null;
    return NextResponse.json({
      comment: text || `「${rewardTitle}」看起來很棒！你值得這份開心 🎀`,
    });
  } catch {
    return NextResponse.json({
      comment: `「${rewardTitle}」看起來很棒！你值得這份開心 🎀`,
      fallback: true,
    });
  }
}
