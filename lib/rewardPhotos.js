// Reward photos live in the private "reward-photos" bucket, one folder per user
// (`<user_id>/<file>`). reward_history.photo_url stores the object path; older
// rows may still hold a full public URL, which we convert back to a path.
export const REWARD_PHOTO_BUCKET = "reward-photos";

export function rewardPhotoPath(value) {
  if (!value || typeof value !== "string") return null;
  const m = value.match(/\/object\/(?:public|sign)\/reward-photos\/([^?#]+)/);
  if (m) return decodeURIComponent(m[1]);
  if (/^https?:\/\//i.test(value)) return null;
  return value;
}

// A path is only usable by the user whose id is its first folder.
export function isOwnRewardPhoto(path, userId) {
  return (
    typeof path === "string" &&
    !!userId &&
    path.startsWith(`${userId}/`) &&
    !path.includes("..") &&
    path.length <= 300
  );
}
