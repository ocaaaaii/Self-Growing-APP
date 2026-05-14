# 慢慢變好 · Self Growing 🌱

一個用溫柔的獎勵機制，幫助你慢慢把自己養成喜歡的樣子的成長 App。
小棕熊 **Mochi** 會一路陪著你。

**目前進度：第一 + 第二階段都完成了** —— 會員登入、習慣養成、點數累積、
獎勵兌換、If→Then 行為規則、每日感恩三件事、成長月曆統計。

技術：Next.js 14（App Router）+ Supabase（登入 + 資料庫）+ TailwindCSS。

---

## 你需要先準備

1. **Node.js**（18 以上版本）— 到 https://nodejs.org 下載安裝
2. **一個 Supabase 帳號**（免費）— https://supabase.com
3. **一個 Vercel 帳號**（免費，最後上架用）— https://vercel.com

---

## 步驟一：建立 Supabase 專案

1. 登入 https://supabase.com → 點「New project」
2. 取一個名字（例如 `growing-app`），設一個資料庫密碼，選一個離你近的區域
3. 等 1～2 分鐘讓它建立完成

### 把資料表建好

1. 在 Supabase 專案左邊選單點 **SQL Editor**
2. 點「New query」
3. 打開本專案的 `supabase/schema.sql`，把**整個檔案的內容**複製貼上
4. 點右下角「Run」執行 — 看到成功訊息就完成了

這會建立全部七張表（profiles、habits、habit_logs、rewards、reward_history、
ifthen_rules、gratitude_entries）、安全規則（每個人只能看到自己的資料），
還有打卡加點數、兌換獎勵、記錄感恩的邏輯。

> **如果你之前只跑過第一階段的 schema**：不用重跑整個 `schema.sql`，
> 只要把 `supabase/migration_phase2.sql` 的內容貼進 SQL Editor 執行一次，
> 就會補上第二階段的四張表與功能（已有的資料不會被動到）。

### 拿到你的 API 金鑰

1. 左邊選單點 **Project Settings**（齒輪圖示）→ **API**
2. 你會看到兩個值：
   - **Project URL**（像 `https://xxxxx.supabase.co`）
   - **anon public** key（一長串文字）
3. 這兩個下一步會用到

### 設定登入方式

1. 左邊選單點 **Authentication** → **Providers**
2. 確認 **Email** 是開啟的
3. （可選）在 **Authentication → Sign In / Up** 裡，如果你想讓朋友註冊後**不用收確認信就能直接用**，可以把「Confirm email」關掉。想保留確認信也可以，App 兩種情況都支援。

---

## 步驟二：在自己電腦上跑起來

1. 用終端機（命令列）進到 `growing-app` 資料夾：
   ```
   cd growing-app
   ```

2. 安裝套件：
   ```
   npm install
   ```

3. 建立環境變數檔。把 `.env.local.example` 複製成一份新檔案叫 `.env.local`，
   然後填入步驟一拿到的兩個值：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://你的專案.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
   ```
   （`.env.local` 不會被上傳到 git，金鑰是安全的）

4. 啟動：
   ```
   npm run dev
   ```

5. 打開瀏覽器到 http://localhost:3000
   你會看到登入畫面 → 先「註冊」一個帳號 → 進到首頁 → 建立習慣 → 打卡看點數累積 🎉

---

## 步驟三：上架（部署到 Vercel）

1. 把 `growing-app` 資料夾推上一個 GitHub repo
   （`.gitignore` 已經設好，`.env.local` 和 `node_modules` 不會被上傳）

2. 到 https://vercel.com → 「Add New Project」→ 選你的 GitHub repo

3. 在 Vercel 的專案設定裡，**Environment Variables** 加上兩個變數
   （跟 `.env.local` 裡一樣）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. 點「Deploy」，等它跑完，你就有一個網址了！

5. **最後一步（重要）**：回到 Supabase → **Authentication** → **URL Configuration**
   - 把 **Site URL** 設成你的 Vercel 網址（例如 `https://growing-app.vercel.app`）
   - 在 **Redirect URLs** 加上 `https://你的網址/auth/callback`
   - 這樣朋友收到的確認信連結才會正確導回 App

做完後，把網址傳給想一起用的朋友就可以囉～每個人都有自己獨立的點數和習慣紀錄。

---

## 專案結構

```
growing-app/
├── app/
│   ├── layout.js              根 layout（字型、metadata）
│   ├── page.js                進入點 → 導向 /welcome 或 /home
│   ├── globals.css            設計系統（奶油咖啡色、Mochi 表情、動畫）
│   ├── welcome/page.js        登入前導覽頁（介紹 App 怎麼用）
│   ├── login/page.js          登入 / 註冊畫面（註冊可設定暱稱）
│   ├── auth/
│   │   ├── callback/route.js  處理 email 確認信的連結
│   │   └── signout/route.js   登出
│   └── (app)/                 登入後的 App（共用手機外框 + 底部導覽）
│       ├── layout.js
│       ├── home/page.js       首頁：問候 + 點數 + 今日小事 + 感恩三件事
│       ├── habits/page.js     習慣頁：清單 + 分類 + 新增 + 我的小空間
│       ├── ifthen/page.js     If→Then 規則：新增 / 編輯 / 啟用切換
│       ├── rewards/page.js    獎勵兌換：清單 + 兌換 + 紀錄
│       └── growth/page.js     成長月曆與統計
├── components/                可愛的 UI 元件（Mochi、卡片、彈窗…）
├── lib/
│   ├── constants.js           分類、難度、鼓勵語等設定
│   └── supabase/              Supabase 連線（瀏覽器 / 伺服器 / middleware）
├── supabase/
│   ├── schema.sql             完整資料庫結構（全新安裝用）
│   └── migration_phase2.sql   第二階段 migration（已跑過第一階段的人用）
├── middleware.js              路由保護：沒登入就導到 /welcome
└── public/mochi.png           Mochi 本人 🐻
```

---

## 功能總覽

**第一階段**
- ✅ Email + 密碼 會員登入 / 註冊，註冊時可設定暱稱
- ✅ 登入前的導覽頁，介紹 App 怎麼用
- ✅ 之後可在「我的小空間」隨時改暱稱（mochi 問候你會用新暱稱）
- ✅ 建立習慣（名稱、圖示、分類、難度、頻率）
- ✅ 打卡完成 → 真的累積點數（存雲端，換裝置也在）
- ✅ 連續天數 streak 自動計算，取消打卡會扣回

**第二階段**
- ✅ 獎勵兌換：建立自己的獎勵清單，用點數兌換（點數不夠會溫柔提醒），含兌換紀錄
- ✅ If→Then 行為規則：新增 / 編輯 / 刪除 / 啟用切換，依分類整理
- ✅ 每日感恩三件事：首頁卡片，每天記一次 +20 點，可回顧過去 14 天
- ✅ 成長月曆：依每天完成的習慣數上色的圓點月曆 + 活躍率 / 總點數 / 最長 streak / 成長天數

設計來源是 `prototype-v1.html` 視覺原型。
