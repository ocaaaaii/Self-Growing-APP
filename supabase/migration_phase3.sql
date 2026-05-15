-- ============================================================
--  慢慢變好 — 第三階段 Migration
--  (主題切換 + 獎勵數量/庫存)
-- ============================================================
--  已經跑過第一、二階段的人：在 Supabase SQL Editor 貼上「這個檔案」
--  執行一次就好。安全、可重複執行，不會動到既有資料。
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
