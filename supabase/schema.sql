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
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
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
  -- 暱稱優先用註冊時填的（存在 metadata），沒有就用 email 前綴
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(new.email, '@', 1)
    )
  );
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
  update public.pr


-- ============================================================
--  第二階段 — 獎勵 / If-Then / 感恩（與 migration_phase2.sql 相同）
-- ============================================================

-- ---------- rewards：使用者自訂的獎勵 ----------
create table if not exists public.rewards (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  emoji          text not null default '🎁',
  category       text not null default '小確幸',   -- 小確幸 / 物品 / 體驗 / 大獎勵
  point_cost     integer not null default 100,
  description    text,
  redeemed_count integer not null default 0,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---------- reward_history：兌換紀錄 ----------
create table if not exists public.reward_history (
  id           uuid primary key default gen_random_uuid(),
  reward_id    uuid not null references public.rewards(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  points_spent integer not null,
  redeemed_at  timestamptz not null default now()
);

-- ---------- ifthen_rules：If→Then 行為規則 ----------
create table if not exists public.ifthen_rules (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  trigger_condition text not null,                       -- IF
  action_response   text not null,                       -- THEN
  category          text not null default '🌅 早晨流程',
  is_enabled        boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------- gratitude_entries：每日感恩三件事 ----------
create table if not exists public.gratitude_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  entry_date    date not null default current_date,
  item_1        text not null,
  item_2        text not null,
  item_3        text not null,
  points_earned integer not null default 20,
  created_at    timestamptz not null default now(),
  unique (user_id, entry_date)                            -- 一天一筆
);

create index if not exists rewards_user_idx        on public.rewards (user_id);
create index if not exists reward_history_user_idx on public.reward_history (user_id);
create index if not exists ifthen_user_idx         on public.ifthen_rules (user_id);
create index if not exists gratitude_user_date_idx on public.gratitude_entries (user_id, entry_date);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.rewards            enable row level security;
alter table public.reward_history     enable row level security;
alter table public.ifthen_rules       enable row level security;
alter table public.gratitude_entries  enable row level security;

-- rewards
drop policy if exists "rewards: read own"   on public.rewards;
drop policy if exists "rewards: insert own" on public.rewards;
drop policy if exists "rewards: update own" on public.rewards;
drop policy if exists "rewards: delete own" on public.rewards;
create policy "rewards: read own"   on public.rewards for select using (auth.uid() = user_id);
create policy "rewards: insert own" on public.rewards for insert with check (auth.uid() = user_id);
create policy "rewards: update own" on public.rewards for update using (auth.uid() = user_id);
create policy "rewards: delete own" on public.rewards for delete using (auth.uid() = user_id);

-- reward_history
drop policy if exists "reward_history: read own"   on public.reward_history;
drop policy if exists "reward_history: insert own" on public.reward_history;
create policy "reward_history: read own"   on public.reward_history for select using (auth.uid() = user_id);
create policy "reward_history: insert own" on public.reward_history for insert with check (auth.uid() = user_id);

-- ifthen_rules
drop policy if exists "ifthen: read own"   on public.ifthen_rules;
drop policy if exists "ifthen: insert own" on public.ifthen_rules;
drop policy if exists "ifthen: update own" on public.ifthen_rules;
drop policy if exists "ifthen: delete own" on public.ifthen_rules;
create policy "ifthen: read own"   on public.ifthen_rules for select using (auth.uid() = user_id);
create policy "ifthen: insert own" on public.ifthen_rules for insert with check (auth.uid() = user_id);
create policy "ifthen: update own" on public.ifthen_rules for update using (auth.uid() = user_id);
create policy "ifthen: delete own" on public.ifthen_rules for delete using (auth.uid() = user_id);

-- gratitude_entries
drop policy if exists "gratitude: read own"   on public.gratitude_entries;
drop policy if exists "gratitude: insert own" on public.gratitude_entries;
drop policy if exists "gratitude: delete own" on public.gratitude_entries;
create policy "gratitude: read own"   on public.gratitude_entries for select using (auth.uid() = user_id);
create policy "gratitude: insert own" on public.gratitude_entries for insert with check (auth.uid() = user_id);
create policy "gratitude: delete own" on public.gratitude_entries for delete using (auth.uid() = user_id);

-- ============================================================
--  redeem_reward — 兌換獎勵：檢查點數夠 → 扣點數 → 寫歷史 → 計數+1
-- ============================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns table (new_total integer, ok boolean, message text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost    integer;
  v_total   integer;
begin
  select point_cost into v_cost
  from public.rewards
  where id = p_reward_id and user_id = v_user_id and is_archived = false;

  if v_cost is null then
    raise exception 'reward not found or not yours';
  end if;

  select total_points into v_total from public.profiles where id = v_user_id;

  -- 點數不夠 → 不扣，回傳提示
  if v_total < v_cost then
    new_total := v_total;
    ok := false;
    message := '點數還不夠喔，再累積一點點';
    return next;
    return;
  end if;

  -- 扣點數
  update public.profiles
  set total_points = total_points - v_cost
  where id = v_user_id
  returning total_points into v_total;

  -- 寫兌換紀錄 + 計數 +1
  insert into public.reward_history (reward_id, user_id, points_spent)
  values (p_reward_id, v_user_id, v_cost);

  update public.rewards
  set redeemed_count = redeemed_count + 1
  where id = p_reward_id;

  new_total := v_total;
  ok := true;
  message := '兌換成功！好好享受 — 你值得 💕';
  return next;
end;
$$;

-- ============================================================
--  save_gratitude — 記下今天的感恩三件事，給 +20 點
--  今天已經寫過就回傳現況（不重複加分）
-- ============================================================
create or replace function public.save_gratitude(
  p_item_1 text,
  p_item_2 text,
  p_item_3 text
)
returns table (new_total integer, already_done boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total   integer;
  v_award   integer := 20;
begin
  if exists (
    select 1 from public.gratitude_entries
    where user_id = v_user_id and entry_date = current_date
  ) then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total;
    already_done := true;
    return next;
    return;
  end if;

  insert into public.gratitude_entries (user_id, item_1, item_2, item_3, points_earned)
  values (v_user_id, p_item_1, p_item_2, p_item_3, v_award);

  update public.profiles
  set total_points = total_points + v_award
  where id = v_user_id
  returning total_points into v_total;

  new_total := v_total;
  already_done := fa


-- ============================================================
--  第三階段 — 主題 / 獎勵庫存（與 migration_phase3.sql 相同）
-- ============================================================

-- ---------- profiles 加 theme：使用者選的主題 ----------
alter table public.profiles
  add column if not exists theme text not null default 'oat';
  -- 可選值：oat（奶茶）/ mint（薄荷）/ sakura（櫻花）/ night（夜貓）

-- ---------- rewards 加 stock：獎勵剩餘數量 ----------
alter table public.rewards
  add column if not exists stock integer;
  -- null = 無限；數字 = 還可以兌換幾次，換到 0 就停用

-- ============================================================
--  redeem_reward — 更新：兌換時檢查並扣庫存
-- ============================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns table (new_total integer, ok boolean, message text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost    integer;
  v_stock   integer;
  v_total   integer;
begin
  select point_cost, stock into v_cost, v_stock
  from public.rewards
  where id = p_reward_id and user_id = v_user_id and is_archived = false;

  if v_cost is null then
    raise exception 'reward not found or not yours';
  end if;

  -- 庫存檢查（null = 無限）
  if v_stock is not null and v_stock <= 0 then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total;
    ok := false;
    message := '這個獎勵已經換完囉';
    return next;
    return;
  end if;

  -- 點數檢查
  select total_points into v_total from public.profiles where id = v_user_id;
  if v_total < v_cost then
    new_total := v_total;
    ok := false;
    message := '點數還不夠喔，再累積一點點';
    return next;
    return;
  end if;

  -- 扣點數
  update public.profiles
  set total_points = total_points - v_cost
  where id = v_user_id
  returning total_points into v_total;

  -- 寫兌換紀錄、計數 +1、庫存 -1（若有設定）
  insert into public.reward_history (reward_id, user_id, points_spent)
  values (p_reward_id, v_user_id, v_cost);

  update public.rewards
  set redeemed_count = redeemed_count + 1,
      stock = case when stock is not null then stock - 1 else null end
  where id = p_reward_id;

  new_total := v_total;
  ok := true;
  message := '兌換成功！好好享受 — 你值得 💕';
  return next;
end;
$$;


-- ============================================================
--  兌換獎勵可拍照 + 留言（與 migration_reward_photos.sql 相同）
-- ============================================================

-- ---------- reward_history 加照片與留言 ----------
alter table public.reward_history
  add column if not exists photo_url text;
alter table public.reward_history
  add column if not exists note text;

-- reward_history 需要 update 權限（原本只有 read / insert）
drop policy if exists "reward_history: update own" on public.reward_history;
create policy "reward_history: update own" on public.reward_history
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- Storage：放兌換照片的 bucket ----------
insert into storage.buckets (id, name, public)
values ('reward-photos', 'reward-photos', true)
on conflict (id) do nothing;

-- 每個人只能上傳到自己的資料夾（檔名開頭是 user_id）；照片可公開讀取
drop policy if exists "reward-photos: public read"  on storage.objects;
drop policy if exists "reward-photos: insert own"   on storage.objects;
drop policy if exists "reward-photos: delete own"   on storage.objects;
create policy "reward-photos: public read" on storage.objects
  for select using (bucket_id = 'reward-photos');
create policy "reward-photos: insert own" on storage.objects
  for insert with check (
    bucket_id = 'reward-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "reward-photos: delete own" on storage.objects
  for delete using (
    bucket_id = 'reward-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
--  redeem_reward — 更新：多回傳 history_id（拿來掛照片/留言）
-- ============================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns table (
  new_total  integer,
  ok         boolean,
  message    text,
  history_id uuid
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost    integer;
  v_stock   integer;
  v_total   integer;
  v_hist    uuid;
begin
  select point_cost, stock into v_cost, v_stock
  from public.rewards
  where id = p_reward_id and user_id = v_user_id and is_archived = false;

  if v_cost is null then
    raise exception 'reward not found or not yours';
  end if;

  -- 庫存檢查（null = 無限）
  if v_stock is not null and v_stock <= 0 then
    select total_points into v_total from public.profiles where id = v_user_id;
    new_total := v_total; ok := false;
    message := '這個獎勵已經換完囉'; history_id := null;
    return next; return;
  end if;

  -- 點數檢查
  select total_points into v_total from public.profiles where id = v_user_id;
  if v_total < v_cost then
    new_total := v_total; ok := false;
    message := '點數還不夠喔，再累積一點點'; history_id := null;
    return next; return;
  end if;

  -- 扣點數
  update public.profiles
  set total_points = total_points - v_cost
  where id = v_user_id
  returning total_points into v_total;

  -- 寫兌換紀錄（拿回 id）
  insert into public.reward_history (reward_id, user_id, points_spent)
  values (p_reward_id, v_user_id, v_cost)
  returning id into v_hist;

  -- 計數 +1、庫存 -1
  update public.rewards
  set redeemed_count = redeemed_count + 1,
      stock = case when stock is not null then stock - 1 else null end
  where id = p_reward_id;

  new_total := v_total; ok := true;
  message := '兌換成功！好好享受 — 你值得 💕';
  history_id := v_hist;
  return next;
end;
$$;
