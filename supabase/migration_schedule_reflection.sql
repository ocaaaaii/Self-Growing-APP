-- ============================================================
--  習慣排程 + 每日復盤 migration
--  在 Supabase SQL Editor 執行一次即可
-- ============================================================

-- ---------- habits 加 schedule_days ----------
-- 只有「每週 3 次」會用到；儲存要顯示的星期（0=日, 1=一, ..., 6=六）
-- null = 未指定（自由 or 每日 or 平日）
alter table public.habits
  add column if not exists schedule_days integer[] default null;

-- ---------- daily_reflections：每日復盤 ----------
create table if not exists public.daily_reflections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  entry_date    date not null default current_date,
  reflection    text not null,
  points_earned integer not null default 10,
  created_at    timestamptz not null default now(),
  unique (user_id, entry_date)   -- 一天只能復盤一次
);

create index if not exists reflections_user_date_idx
  on public.daily_reflections (user_id, entry_date);

alter table public.daily_reflections enable row level security;

drop policy if exists "reflections: read own"   on public.daily_reflections;
drop policy if exists "reflections: insert own" on public.daily_reflections;
create policy "reflections: read own"   on public.daily_reflections
  for select using (auth.uid() = user_id);
create policy "reflections: insert own" on public.daily_reflections
  for insert with check (auth.uid() = user_id);

-- ============================================================
--  save_reflection — 存下某天的復盤，給 +10 點
--  p_entry_date 預設是今天；隔天補寫昨天的復盤時傳入昨天日期
--  同一天已寫過就不重複加分
-- ============================================================
create or replace function public.save_reflection(
  p_reflection text,
  p_entry_date date default current_date
)
returns table (new_total integer, already_done boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total   integer;
  v_award   integer := 10;
begin
  -- 該日已復盤過
  if exists (
    select 1 from public.daily_reflections
    where user_id = v_user_id and entry_date = p_entry_date
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total    := v_total;
    already_done := true;
    return next;
    return;
  end if;

  insert into public.daily_reflections (user_id, reflection, points_earned, entry_date)
  values (v_user_id, p_reflection, v_award, p_entry_date);

  update public.profiles
  set total_points = total_points + v_award
  where id = v_user_id
  returning total_points into v_total;

  new_total    := v_total;
  already_done := false;
  return next;
end;
$$;
