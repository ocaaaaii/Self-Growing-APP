-- ============================================================
--  意見回饋表單：feedback 資料表
-- ============================================================
--  /feedback 頁送出的內容會存在這裡。
--  任何人（含未登入）都可以新增一筆，但沒有人能從 App 讀取、
--  修改或刪除；只有在 Supabase 後台（Table Editor）看得到。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
-- ============================================================

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users (id) on delete set null,
  category    text not null default 'other'
              check (category in ('idea', 'bug', 'account', 'other')),
  message     text not null
              check (char_length(message) between 1 and 2000),
  reply_email text
              check (reply_email is null or char_length(reply_email) <= 200),
  page        text check (page is null or char_length(page) <= 200),
  status      text not null default 'new'
              check (status in ('new', 'read', 'done'))
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- 只能新增；登入的人只能用自己的 user_id，未登入的 user_id 必須是空的。
-- 新增時不能自己指定 status。
drop policy if exists "feedback: insert" on public.feedback;
create policy "feedback: insert" on public.feedback
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = auth.uid())
    and status = 'new'
  );

-- 不建立 select / update / delete 政策：App 端讀不到任何回饋。
