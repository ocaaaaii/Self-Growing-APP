-- ============================================================
--  Migration v4 — 休息日 + 每週回顧 + streak 修正
--  在 Supabase SQL Editor 執行一次即可
-- ============================================================

-- ---------- rest_days：今天請假 ----------
create table if not exists public.rest_days (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  rest_date     date not null default current_date,
  reason        text not null,
  points_earned integer not null default 5,
  created_at    timestamptz not null default now(),
  unique (user_id, rest_date)
);

create index if not exists rest_days_user_date_idx
  on public.rest_days (user_id, rest_date);

alter table public.rest_days enable row level security;

drop policy if exists "rest_days: read own"   on public.rest_days;
drop policy if exists "rest_days: insert own" on public.rest_days;
create policy "rest_days: read own"   on public.rest_days
  for select using (auth.uid() = user_id);
create policy "rest_days: insert own" on public.rest_days
  for insert with check (auth.uid() = user_id);

-- ---------- weekly_reviews：每週回顧 ----------
create table if not exists public.weekly_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_start    date not null,  -- 該週的週一
  proud_moment  text not null,
  points_earned integer not null default 15,
  created_at    timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_reviews_user_week_idx
  on public.weekly_reviews (user_id, week_start);

alter table public.weekly_reviews enable row level security;

drop policy if exists "weekly_reviews: read own"   on public.weekly_reviews;
drop policy if exists "weekly_reviews: insert own" on public.weekly_reviews;
create policy "weekly_reviews: read own"   on public.weekly_reviews
  for select using (auth.uid() = user_id);
create policy "weekly_reviews: insert own" on public.weekly_reviews
  for insert with check (auth.uid() = user_id);

-- ============================================================
--  save_rest_day — 標記今天為休息日，給 +5 點
--  同一天已標記就不重複加分
-- ============================================================
create or replace function public.save_rest_day(p_reason text)
returns table (new_total integer, already_done boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total   integer;
  v_award   integer := 5;
begin
  if exists (
    select 1 from public.rest_days
    where user_id = v_user_id and rest_date = current_date
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total; already_done := true;
    return next; return;
  end if;

  insert into public.rest_days (user_id, reason, points_earned)
  values (v_user_id, p_reason, v_award);

  update public.profiles
  set total_points = total_points + v_award
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total; already_done := false;
  return next;
end;
$$;

-- ============================================================
--  save_weekly_review — 存下本週回顧，給 +15 點
--  同一週已寫過就不重複加分
-- ============================================================
create or replace function public.save_weekly_review(
  p_week_start  date,
  p_proud_moment text
)
returns table (new_total integer, already_done boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total   integer;
  v_award   integer := 15;
begin
  if exists (
    select 1 from public.weekly_reviews
    where user_id = v_user_id and week_start = p_week_start
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total; already_done := true;
    return next; return;
  end if;

  insert into public.weekly_reviews (user_id, week_start, proud_moment, points_earned)
  values (v_user_id, p_week_start, p_proud_moment, v_award);

  update public.profiles
  set total_points = total_points + v_award
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total; already_done := false;
  return next;
end;
$$;

-- ============================================================
--  award_habit_points — 更新版：休息日也算 streak 不中斷
--  邏輯：昨天有打卡 OR 昨天是休息日 → streak 繼續
-- ============================================================
create or replace function public.award_habit_points(p_habit_id uuid)
returns table (new_total integer, points_earned integer, new_streak integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_points    integer;
  v_streak    integer;
  v_total     integer;
  v_continue  boolean;
begin
  select point_value into v_points
  from public.habits
  where id = p_habit_id and user_id = v_user_id;

  if v_points is null then
    raise exception 'habit not found or not yours';
  end if;

  -- 今天已打卡 → 直接回傳
  if exists (
    select 1 from public.habit_logs
    where habit_id = p_habit_id and completed_on = current_date
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    select streak into v_streak from public.habits where id = p_habit_id;
    new_total := v_total; points_earned := 0; new_streak := v_streak;
    return next; return;
  end if;

  -- 昨天有打卡 OR 昨天是休息日 → streak 繼續
  select exists (
    select 1 from public.habit_logs
    where habit_id = p_habit_id and completed_on = current_date - 1
    union all
    select 1 from public.rest_days
    where user_id = v_user_id and rest_date = current_date - 1
    limit 1
  ) into v_continue;

  if v_continue then
    update public.habits set streak = streak + 1
    where id = p_habit_id returning streak into v_streak;
  else
    update public.habits set streak = 1
    where id = p_habit_id returning streak into v_streak;
  end if;

  insert into public.habit_logs (habit_id, user_id, points_earned)
  values (p_habit_id, v_user_id, v_points);

  update public.profiles
  set total_points = total_points + v_points
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total; points_earned := v_points; new_streak := v_streak;
  return next;
end;
$$;
