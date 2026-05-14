-- ============================================================
--  慢慢變好 — 第二階段 Migration
--  (獎勵兌換 / If-Then 規則 / 每日感恩)
-- ============================================================
--  如果你已經跑過第一階段的 schema.sql，只要在 Supabase SQL Editor
--  貼上「這個檔案」執行一次就好。
--  （全新安裝的人直接用 schema.sql 即可，已包含這段）
-- ============================================================

-- ---------- 更新 handle_new_user：暱稱改從註冊 metadata 讀 ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
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
  already_done := false;
  return next;
end;
$$;
