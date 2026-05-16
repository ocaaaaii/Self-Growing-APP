"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { REWARD_CATEGORIES } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import PointsCard from "./PointsCard";
import RewardCard from "./RewardCard";
import AddRewardModal from "./AddRewardModal";
import RewardConfirmModal from "./RewardConfirmModal";
import JoyRecordModal from "./JoyRecordModal";
import Modal from "./Modal";

const FILTERS = ["全部", ...REWARD_CATEGORIES];

export default function RewardsClient({ initialPoints, rewards: initialRewards, history }) {
  const router = useRouter();
  const supabase = createClient();
  const frameRef = useRef(null);

  const [points, setPoints] = useState(initialPoints);
  const [rewards, setRewards] = useState(initialRewards);
  const [filter, setFilter] = useState("全部");
  const [showAdd, setShowAdd] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // {reward, affordable}
  const [busy, setBusy] = useState(false);
  const [joyRecord, setJoyRecord] = useState(null); // {historyId, rewardTitle}
  const [showHistory, setShowHistory] = useState(false);

  const shown =
    filter === "全部" ? rewards : rewards.filter((r) => r.category === filter);

  // shared FAB (in the app shell) fires this event → open in ADD mode
  useEffect(() => {
    const open = () => {
      setEditingReward(null);
      setShowAdd(true);
    };
    window.addEventListener("app-fab", open);
    return () => window.removeEventListener("app-fab", open);
  }, []);

  function openEditReward(reward) {
    setEditingReward(reward);
    setShowAdd(true);
  }

  function confetti() {
    if (!frameRef.current) return;
    const f = frameRef.current;
    ["🎀", "✨", "🌟", "💕", "🎊", "⭐"].forEach((e, i) => {
      setTimeout(() => {
        const c = document.createElement("div");
        c.className = "sparkle-burst";
        c.textContent = e;
        c.style.left = 40 + Math.random() * 280 + "px";
        c.style.top = "38%";
        f.appendChild(c);
        setTimeout(() => c.remove(), 800);
      }, i * 80);
    });
  }

  async function handleSaveReward(form) {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (editingReward) {
        const { data, error } = await supabase
          .from("rewards")
          .update(form)
          .eq("id", editingReward.id)
          .select()
          .single();
        if (error) throw error;
        setRewards((rs) =>
          rs.map((r) => (r.id === editingReward.id ? data : r))
        );
      } else {
        const { data, error } = await supabase
          .from("rewards")
          .insert({ ...form, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        setRewards((rs) => [...rs, data]);
      }
      setShowAdd(false);
      setEditingReward(null);
    } catch (err) {
      alert("沒能儲存，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReward(reward) {
    // 注意：用 window.confirm，因為這個元件裡有 state 叫 `confirm`，會遮蔽全域的 confirm()
    if (!window.confirm(`確定要刪除「${reward.title}」嗎？`)) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", reward.id);
      if (error) throw error;
      setRewards((rs) => rs.filter((r) => r.id !== reward.id));
      setShowAdd(false);
      setEditingReward(null);
    } catch (err) {
      alert("沒能刪除，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmRedeem() {
    if (!confirm?.reward) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("redeem_reward", {
        p_reward_id: confirm.reward.id,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.ok) {
        // not enough points (shouldn't happen — guarded in UI)
        setConfirm(null);
        return;
      }
      setPoints(row.new_total);
      setRewards((rs) =>
        rs.map((r) =>
          r.id === confirm.reward.id
            ? {
                ...r,
                redeemed_count: r.redeemed_count + 1,
                stock:
                  r.stock !== null && r.stock !== undefined
                    ? Math.max(r.stock - 1, 0)
                    : r.stock,
              }
            : r
        )
      );
      const redeemed = confirm.reward;
      setConfirm(null);
      confetti();
      setTimeout(
        () =>
          setJoyRecord({
            historyId: row.history_id,
            rewardTitle: redeemed.title,
          }),
        250
      );
    } catch (err) {
      alert("兌換時出了點狀況，再試一次：" + (err?.message || ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={frameRef} className="relative">
      <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
        {/* header */}
        <div className="mb-[18px] mt-1.5">
          <div className="font-hand text-lg text-milktea">my rewards</div>
          <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
            你<span className="underline-cute">值得</span>被寵愛 🎀
          </h1>
          <p className="mt-1 text-[13px] text-milktea">
            用累積的點數，溫柔地寵愛自己
          </p>
        </div>

        <PointsCard points={points} compact />

        {/* history banner — its own row, more visible */}
        <button
          onClick={() => setShowHistory(true)}
          className="mt-3 flex w-full items-center justify-between rounded-xl2 border border-line/50 bg-cream-card px-4 py-3 shadow-soft transition hover:-translate-y-px hover:shadow-lift"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-cocoa-deep">
            <span className="text-base">🎀</span>
            兌換紀錄
            {history.length > 0 && (
              <span className="rounded-full bg-beige px-2 py-0.5 text-[10px] font-bold text-cocoa">
                {history.length}
              </span>
            )}
          </span>
          <span className="text-xs text-milktea">看回憶 →</span>
        </button>

        {/* category filter */}
        <div className="no-scrollbar mb-4 mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-2xl border px-3.5 py-[7px] text-xs font-medium transition ${
                filter === f
                  ? "border-cocoa bg-cocoa text-cream-card"
                  : "border-line bg-cream-card text-cocoa"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* grid */}
        {rewards.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
            <Mochi mood="happy" size={84} />
            <p className="mt-3 text-sm font-medium text-cocoa-deep">
              還沒有任何獎勵
            </p>
            <p className="mt-1 text-xs text-milktea">
              想想看 — 努力之後，你想用什麼寵愛自己？
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-semibold text-cream-card shadow-soft"
              style={{ background: "linear-gradient(135deg, rgb(var(--grad-btn-from)), rgb(var(--grad-btn-to)))" }}
            >
              建立第一個獎勵 🎀
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center text-sm text-milktea shadow-soft">
            這個分類還沒有獎勵～
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {shown.map((r) => (
              <RewardCard
                key={r.id}
                reward={r}
                points={points}
                onEdit={openEditReward}
                onClick={(reward) => {
                  const soldOut =
                    reward.stock !== null &&
                    reward.stock !== undefined &&
                    reward.stock <= 0;
                  const affordable =
                    !soldOut && points >= reward.point_cost;
                  setConfirm({ reward, affordable, soldOut });
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
          <Bow size={14} /> 我有努力，所以我值得
        </div>
      </div>

      <AddRewardModal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          setEditingReward(null);
        }}
        onSave={handleSaveReward}
        onDelete={handleDeleteReward}
        reward={editingReward}
        saving={saving}
      />
      <RewardConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        reward={confirm?.reward}
        affordable={confirm?.affordable}
        soldOut={confirm?.soldOut}
        busy={busy}
        onConfirm={handleConfirmRedeem}
      />
      <JoyRecordModal
        open={!!joyRecord}
        onClose={() => {
          setJoyRecord(null);
          router.refresh();
        }}
        historyId={joyRecord?.historyId}
        rewardTitle={joyRecord?.rewardTitle}
        onSaved={() => router.refresh()}
      />

      {/* history modal */}
      <Modal open={showHistory} onClose={() => setShowHistory(false)}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-milktea-soft" />
        <button
          onClick={() => setShowHistory(false)}
          className="absolute right-[22px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-beige text-cocoa"
        >
          ✕
        </button>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-cocoa-deep">
          <Bow size={20} /> 兌換紀錄
        </h2>
        <p className="mb-[18px] text-xs text-milktea">
          那些你給自己的、值得的禮物
        </p>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-milktea">
            還沒有兌換紀錄～完成習慣累積點數，然後好好寵愛自己 🎀
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-[14px] border border-line/40 bg-cream-card px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{h.rewards?.emoji || "🎁"}</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-cocoa-deep">
                      {h.rewards?.title || "獎勵"}
                    </div>
                    <div className="text-[11px] text-milktea">
                      {new Date(h.redeemed_at).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cocoa">
                    - {h.points_spent} pt
                  </span>
                </div>

                {h.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.photo_url}
                    alt="兌換照片"
                    className="mt-2.5 h-36 w-full rounded-xl object-cover"
                  />
                )}
                {h.note && (
                  <p className="mt-2 rounded-xl bg-cream-paper px-3 py-2 text-[12px] italic leading-relaxed text-cocoa">
                    「{h.note}」
                  </p>
                )}
                {h.ai_comment && (
                  <p className="mt-2 rounded-xl bg-beige/60 px-3 py-2 text-[12px] leading-relaxed text-cocoa-deep">
                    🐻💬 {h.ai_comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
