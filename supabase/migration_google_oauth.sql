-- ============================================================
--  Google 登入：新使用者的暱稱改用 Google 名字
-- ============================================================
--  不跑這段也能用 Google 登入：on_auth_user_created 觸發器對
--  所有新帳號（含 Google）都會建立 profiles 資料列，只是暱稱
--  會是 email 前綴。跑了之後，Google 使用者的暱稱會優先用
--  Google 帳號上的名字。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。安全、可重複執行。
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'username', ''),   -- email 註冊時填的暱稱
        nullif(new.raw_user_meta_data ->> 'full_name', ''),  -- Google 名字
        nullif(new.raw_user_meta_data ->> 'name', ''),
        split_part(new.email, '@', 1)
      ),
      20
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
