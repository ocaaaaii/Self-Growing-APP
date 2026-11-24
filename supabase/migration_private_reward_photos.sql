-- ============================================================
--  兌換照片改為不公開
--  1. reward-photos bucket 改成 private，拿掉「任何人可讀」的政策
--  2. 每個人只能讀自己資料夾（<user_id>/...）的照片
--  3. 舊紀錄存的是完整公開網址，改存檔案路徑；App 顯示時再產生有時效的網址
--
--  在 Supabase SQL Editor 貼上整段執行一次即可。可重複執行。
--  先部署會處理路徑的 App 版本，再執行這段。
-- ============================================================

update storage.buckets set public = false where id = 'reward-photos';

drop policy if exists "reward-photos: public read" on storage.objects;
drop policy if exists "reward-photos: read own" on storage.objects;
create policy "reward-photos: read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reward-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

update public.reward_history
set photo_url = regexp_replace(photo_url, '^.*/object/public/reward-photos/', '')
where photo_url like '%/object/public/reward-photos/%';
