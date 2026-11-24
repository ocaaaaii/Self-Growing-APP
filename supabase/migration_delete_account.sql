-- ============================================================
--  使用者自己刪除帳號
--  delete_my_account() 只會刪掉「呼叫者自己」的 auth.users 資料列。
--  其他資料表都以 on delete cascade 連到 auth.users，會一起刪除；
--  feedback 是 on delete set null，回饋內容保留但不再連到帳號。
--  兌換照片（storage）無法用 SQL 刪，App 會在呼叫這個函式前先刪掉。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
