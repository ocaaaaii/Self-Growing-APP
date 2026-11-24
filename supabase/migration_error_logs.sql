-- ============================================================
--  錯誤紀錄（內建錯誤監控）
--  App 在瀏覽器或頁面出錯時，透過 /api/log-error 記一筆到這裡。
--  任何人都只能新增，App 端讀不到；在 Supabase Table Editor 查看。
--  全站每分鐘最多 60 筆，避免被灌爆。
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
-- ============================================================

create table if not exists public.error_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users (id) on delete set null,
  source      text not null default 'client'
              check (source in ('client', 'boundary', 'global')),
  message     text not null check (char_length(message) between 1 and 1000),
  stack       text check (stack is null or char_length(stack) <= 4000),
  url         text check (url is null or char_length(url) <= 300),
  user_agent  text check (user_agent is null or char_length(user_agent) <= 300),
  digest      text check (digest is null or char_length(digest) <= 100)
);

create index if not exists error_logs_created_at_idx on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;

drop policy if exists "error_logs: insert" on public.error_logs;
create policy "error_logs: insert" on public.error_logs
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create or replace function public.error_logs_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.error_logs where created_at > now() - interval '1 minute') >= 60 then
    raise exception 'error_logs_rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists error_logs_rate_limit on public.error_logs;
create trigger error_logs_rate_limit
  before insert on public.error_logs
  for each row execute function public.error_logs_rate_limit();
