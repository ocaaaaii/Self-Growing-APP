"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IFTHEN_CATEGORIES } from "@/lib/constants";
import Mochi from "./Mochi";
import Bow from "./Bow";
import IfThenCard from "./IfThenCard";
import IfThenModal from "./IfThenModal";
import Fab from "./Fab";

const FILTERS = ["全部", ...IFTHEN_CATEGORIES];

export default function IfThenClient({ rules: initialRules }) {
  const supabase = createClient();

  const [rules, setRules] = useState(initialRules);
  const [filter, setFilter] = useState("全部");
  const [editing, setEditing] = useState(null); // rule being edited
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const shown =
    filter === "全部" ? rules : rules.filter((r) => r.category === filter);

  function openAdd() {
    setEditing(null);
    setShowModal(true);
  }
  function openEdit(rule) {
    setEditing(rule);
    setShowModal(true);
  }

  async function handleSave(form) {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (editing) {
        const { data, error } = await supabase
          .from("ifthen_rules")
          .update(form)
          .eq("id", editing.id)
          .select()
          .single();
        if (error) throw error;
        setRules((rs) => rs.map((r) => (r.id === editing.id ? data : r)));
      } else {
        const { data, error } = await supabase
          .from("ifthen_rules")
          .insert({ ...form, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        setRules((rs) => [...rs, data]);
      }
      setShowModal(false);
      setEditing(null);
    } catch (err) {
      alert("沒能儲存，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rule) {
    if (!confirm("確定要刪除這個規則嗎？")) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("ifthen_rules")
        .delete()
        .eq("id", rule.id);
      if (error) throw error;
      setRules((rs) => rs.filter((r) => r.id !== rule.id));
      setShowModal(false);
      setEditing(null);
    } catch (err) {
      alert("沒能刪除，再試一次：" + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule) {
    setBusyId(rule.id);
    try {
      const { data, error } = await supabase
        .from("ifthen_rules")
        .update({ is_enabled: !rule.is_enabled })
        .eq("id", rule.id)
        .select()
        .single();
      if (error) throw error;
      setRules((rs) => rs.map((r) => (r.id === rule.id ? data : r)));
    } catch (err) {
      alert("切換失敗，再試一次：" + (err?.message || ""));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="relative">
      <div className="animate-fadeIn px-[22px] pb-[100px] pt-2">
        <div className="mb-[18px] mt-1.5">
          <div className="font-hand text-lg text-milktea">if-then rules</div>
          <h1 className="mt-0.5 text-[22px] font-medium leading-snug text-cocoa-deep">
            讓好習慣<span className="underline-cute">自動發生</span> 💫
          </h1>
          <p className="mt-1 text-[13px] text-milktea">不靠意志力，靠自動反射</p>
        </div>

        {/* filter */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
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

        {rules.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center shadow-soft">
            <Mochi mood="happy" size={84} />
            <p className="mt-3 text-sm font-medium text-cocoa-deep">
              還沒有任何規則
            </p>
            <p className="mt-1 text-xs leading-relaxed text-milktea">
              建立「IF 觸發 → THEN 行動」
              <br />
              讓好習慣變成不用想的反射動作
            </p>
            <button
              onClick={openAdd}
              className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-semibold text-cream-card shadow-soft"
              style={{ background: "linear-gradient(135deg,#A47854,#8B5E3F)" }}
            >
              建立第一個規則 💫
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl2 border border-line/50 bg-cream-card/70 px-5 py-8 text-center text-sm text-milktea shadow-soft">
            這個分類還沒有規則～
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((r) => (
              <IfThenCard
                key={r.id}
                rule={r}
                busy={busyId === r.id}
                onEdit={openEdit}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-milktea">
          <Bow size={14} /> 建立你自己的生活系統
        </div>
      </div>

      <Fab onClick={openAdd} />
      <IfThenModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        rule={editing}
        saving={saving}
      />
    </div>
  );
}
