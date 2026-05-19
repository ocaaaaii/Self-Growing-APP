-- Migration v6: Add locale column to profiles for multi-language support
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'zh-TW';

-- Update any existing rows that don't have a locale set
UPDATE profiles
  SET locale = 'zh-TW'
  WHERE locale IS NULL;
