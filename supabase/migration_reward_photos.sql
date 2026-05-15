-- ============================================================
--  慢慢變好 — 兌換獎勵可拍照 + 留言
-- ============================================================
--  使用方式：在 Supabase SQL Editor 裡，先清空編輯器，
--  把「整個檔案」貼上，直接按 Run（不要只反白一部分執行）。
--  安全、可重複執行。
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
drop policy if exists "reward-photos: public read" on storage.objects;
drop policy if exists "reward-photos: insert own" on storage.objects;
drop policy if exists "reward-photos: delete own" on storage.objects;

create policy "reward-photos: public read" on storage.objects
  for select
  using (bucket_id = 'reward-photos');

create policy "reward-photos: insert own" on storage.objects
  for insert
  with check (
    bucket_id = 'reward-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reward-photos: delete own" on storage.objects
  for delete
  using (
    bucket_id = 'reward-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
--  redeem_reward — 更新：多回傳 history_id（拿來掛照片/留言）
-- ============================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns table (new_total integer, ok boolean, message text, history_id uuid)
language plpgsql
security definer
set search_path = public
as $redeem$
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
    new_total := v_total;
    ok := false;
    message := '這個獎勵已經換完囉';
    history_id := null;
    return next;
    return;
  end if;

  -- 點數檢查
  select total_points into v_total from public.profiles where id = v_user_id;
  if v_total < v_cost then
    new_total := v_total;
    ok := false;
    message := '點數還不夠喔，再累積一點點';
    history_id := null;
    return next;
    return;
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

  new_total := v_total;
  ok := true;
  message := '兌換成功！好好享受 — 你值得 💕';
  history_id := v_hist;
  return next;
end;
$redeem$;
