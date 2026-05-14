-- ============================================================
--  慢慢變好 — Database schema (Phase 1: 登入 + 習慣 + 點數)
-- ============================================================
--  在 Supabase 專案的 SQL Editor 貼上整段執行一次即可。
--  之後加獎勵 / If-Then / 感恩功能時，再補上對應的表。
-- ============================================================

-- ---------- profiles：每個使用者的個人資料 ----------
-- 對應到 Supabase 內建的 auth.users，每個帳號一筆
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text,
  avatar       text,
  total_points integer not null default 0,
  level        integer not null default 1,
  created_at   timestamptz not null default now()
);

-- ---------- habits：使用者建立的習慣 ----------
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  emoji       text not null default '🌱',
  category    text not null default '生活',           -- 健康 / 學習 / 生活 / 心靈 / 不要做
  difficulty  text not null default '簡單',           -- 簡單 / 中等 / 困難
  point_value integer not null default 5,
  frequency   text not null default '每日',           -- 每日 / 平日 / 每週 3 次 / 自由
  streak      integer not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- habit_logs：每次打卡的紀錄 ----------
create table if not exists public.habit_logs (
  id            uuid primary key default gen_random_uuid(),
  habit_id      uuid not null references public.habits(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  completed_on  date not null default current_date,    -- 哪一天完成的
  points_earned integer not null default 0,
  created_at    timestamptz not null default now(),
  -- 同一個習慣同一天只能打卡一次
  unique (habit_id, completed_on)
);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, completed_on);
create index if not exists habits_user_idx
  on public.habits (user_id);

-- ============================================================
--  Row Level Security — 每個人只能看到/改到自己的資料
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.habits     enable row level security;
alter table public.habit_logs enable row level security;

-- profiles
drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = id);

-- habits
drop policy if exists "habits: read own"   on public.habits;
drop policy if exists "habits: insert own" on public.habits;
drop policy if exists "habits: update own" on public.habits;
drop policy if exists "habits: delete own" on public.habits;
create policy "habits: read own"   on public.habits for select using (auth.uid() = user_id);
create policy "habits: insert own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits: update own" on public.habits for update using (auth.uid() = user_id);
create policy "habits: delete own" on public.habits for delete using (auth.uid() = user_id);

-- habit_logs
drop policy if exists "habit_logs: read own"   on public.habit_logs;
drop policy if exists "habit_logs: insert own" on public.habit_logs;
drop policy if exists "habit_logs: delete own" on public.habit_logs;
create policy "habit_logs: read own"   on public.habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs: insert own" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "habit_logs: delete own" on public.habit_logs for delete using (auth.uid() = user_id);

-- ============================================================
--  自動建立 profile — 有人註冊時，自動補一筆 profiles
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  award_habit_points — 打卡時：寫 log + 加點數 + 更新 streak
--  用一個 function 包起來，確保資料一致。
--  回傳：新的總點數、這次拿到的點數、新的連續天數。
--  若今天已打卡，points_earned 會回傳 0（不重複加分）。
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
  v_yesterday boolean;
begin
  -- 確認這個習慣屬於目前登入的人
  select point_value into v_points
  from public.habits
  where id = p_habit_id and user_id = v_user_id;

  if v_points is null then
    raise exception 'habit not found or not yours';
  end if;

  -- 今天已經打過卡了 → 直接回傳現況，不重複加分
  if exists (
    select 1 from public.habit_logs
    where habit_id = p_habit_id and completed_on = current_date
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    select streak into v_streak from public.habits where id = p_habit_id;
    new_total := v_total;
    points_earned := 0;
    new_streak := v_streak;
    return next;
    return;
  end if;

  -- 昨天有打卡嗎？有的話 streak +1，否則重設為 1
  select exists (
    select 1 from public.habit_logs
    where habit_id = p_habit_id and completed_on = current_date - 1
  ) into v_yesterday;

  if v_yesterday then
    update public.habits set streak = streak + 1
    where id = p_habit_id returning streak into v_streak;
  else
    update public.habits set streak = 1
    where id = p_habit_id returning streak into v_streak;
  end if;

  -- 寫一筆打卡紀錄
  insert into public.habit_logs (habit_id, user_id, points_earned)
  values (p_habit_id, v_user_id, v_points);

  -- 加總點數到 profile
  update public.profiles
  set total_points = total_points + v_points
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total;
  points_earned := v_points;
  new_streak := v_streak;
  return next;
end;
$$;

-- ============================================================
--  undo_habit_log — 取消今天的打卡（扣回點數、streak -1）
-- ============================================================
create or replace function public.undo_habit_log(p_habit_id uuid)
returns table (new_total integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_points  integer;
  v_total   integer;
begin
  -- 找出今天這筆打卡紀錄拿了多少點
  select points_earned into v_points
  from public.habit_logs
  where habit_id = p_habit_id
    and user_id = v_user_id
    and completed_on = current_date;

  if v_points is null then
    -- 今天本來就沒打卡，回傳現況
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total;
    return next;
    return;
  end if;

  -- 刪掉今天的打卡紀錄
  delete from public.habit_logs
  where habit_id = p_habit_id
    and user_id = v_user_id
    and completed_on = current_date;

  -- streak 減 1（不低於 0）
  update public.habits
  set streak = greatest(streak - 1, 0)
  where id = p_habit_id;

  -- 扣回點數
  update public.profiles
  set total_points = greatest(total_points - v_points, 0)
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total;
  return next;
end;
$$;
