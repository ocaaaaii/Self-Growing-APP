-- ============================================================
--  修正：暱稱無法顯示 / 無法更新
-- ============================================================
--  症狀：問候語只顯示 email 前綴；在「我的小空間」改暱稱沒有反應。
--  原因：早期註冊的帳號可能沒有對應的 profiles 資料列，
--        導致更新時改到 0 列（不會報錯，但也沒生效）。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。安全、可重複執行。
-- ============================================================

-- 1) 幫每個現有帳號補一筆 profile（已存在的不會被覆蓋）
insert into public.profiles (id, username)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'username', ''),
    split_part(u.email, '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- 2) 把空白的 username 補成 email 前綴（保險）
update public.profiles p
set username = split_part(u.email, '@', 1)
from auth.users u
where p.id = u.id
  and (p.username is null or p.username = '');

-- 3) 讓 profiles 的 update 政策明確包含 with check
--    （明確寫出來，避免任何 RLS 邊界情況）
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 完成後：回到 App 的「我的小空間」改暱稱，就會正常生效了 🌱
