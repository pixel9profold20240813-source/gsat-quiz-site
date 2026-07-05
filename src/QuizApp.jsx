import React, { useState, useEffect, useCallback } from "react";
import {
  getBuiltinQuizSets,
  loadCustomQuizSets,
  saveCustomQuizSets,
  groupQuestions,
  QUESTION_TYPE_LABELS,
} from "./quizData.js";
import { gradeQuestion, computeSetScore, estimateLevel } from "./scoring.js";
import { getLevelScale } from "./examConfig.js";
import SettingsScreen from "./SettingsScreen.jsx";

const BUILTIN_MODULES = []; // 學測版目前沒有內建題庫，需透過設定頁上傳 questions_merged.json
const PROGRESS_STORAGE_KEY = "cap-quiz-progress-v2";
const SCORE_MODE_STORAGE_KEY = "cap-quiz-score-mode-v1";

/* ---------- 進度儲存（按題庫id分開記錄） ---------- */

function useProgress() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      setState(raw ? JSON.parse(raw) : {});
    } catch (e) {
      setState({});
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next) => {
    setState(next);
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("storage set failed", e);
    }
  }, []);

  return { state, loaded, save };
}

function getSetProgress(progressState, setId) {
  return progressState[setId] || { wrongIds: [], history: [] };
}

/* ---------- 計分模式（答對率 / 估算級分），全站共用一個設定 ---------- */

function useScoreMode() {
  const [mode, setMode] = useState("rate"); // "rate" | "level"
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCORE_MODE_STORAGE_KEY);
      if (saved === "rate" || saved === "level") setMode(saved);
    } catch (e) {}
  }, []);
  const update = useCallback((next) => {
    setMode(next);
    try {
      localStorage.setItem(SCORE_MODE_STORAGE_KEY, next);
    } catch (e) {}
  }, []);
  return [mode, update];
}

function ScoreModeToggle({ mode, onChange, levelAvailable }) {
  return (
    <div className="inline-flex border border-[#1a1a1a] rounded-2xl overflow-hidden text-xs font-mono mb-4">
      <button
        onClick={() => onChange("rate")}
        className={`px-3 py-1.5 transition-colors ${mode === "rate" ? "bg-[#1a1a1a] text-white" : "text-[#1a1a1a]"}`}
      >
        答對率
      </button>
      <button
        onClick={() => levelAvailable && onChange("level")}
        disabled={!levelAvailable}
        title={levelAvailable ? "" : "此題庫尚無官方級距資料，暫時無法估算級分"}
        className={`px-3 py-1.5 transition-colors ${
          mode === "level" && levelAvailable ? "bg-[#1a1a1a] text-white" : "text-[#1a1a1a]"
        } ${!levelAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        估算級分
      </button>
    </div>
  );
}

/* ---------- 畫面：題庫選擇首頁 ---------- */

function LibraryScreen({ quizSets, progressState, onSelectSet, onOpenSettings }) {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-12 pb-8">
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="text-xs tracking-[0.25em] text-[#9a3324] font-mono mb-2">
              大學學科能力測驗 ・ 刷題系統
            </div>
            <h1 className="text-4xl font-bold text-[#1a1a1a] leading-tight" style={{ fontFamily: "'Noto Serif TC', serif" }}>
              准考證
            </h1>
          </div>
          <button
            onClick={onOpenSettings}
            aria-label="設定"
            className="border border-[#1a1a1a] w-10 h-10 flex items-center justify-center text-lg shrink-0 rounded-2xl"
          >
            ⚙
          </button>
        </div>
        <div className="h-px bg-[#1a1a1a] mb-6 rounded-2xl" />

        <div className="text-sm font-semibold text-[#1a1a1a] mb-3">選擇題庫</div>
        <div className="space-y-3">
          {quizSets.map((set) => {
            const progress = getSetProgress(progressState, set.id);
            return (
              <button
                key={set.id}
                onClick={() => onSelectSet(set)}
                className="w-full text-left border border-[#1a1a1a] bg-white p-4 flex items-center justify-between active:bg-[#f0eee8] rounded-2xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-[#1a1a1a]">
                      {set.meta.year}年 {set.meta.subjectLabel}科
                    </span>
                  </div>
                  <div className="text-xs text-[#999] mt-1">
                    {set.questions.length} 題
                    {progress.wrongIds.length > 0 && (
                      <span className="text-[#9a3324]"> ・ 錯題 {progress.wrongIds.length}</span>
                    )}
                  </div>
                </div>
                <span className="text-xl text-[#9a3324]">→</span>
              </button>
            );
          })}
        </div>

        {quizSets.length === 0 && (
          <div className="text-center py-16 text-[#999] text-sm">
            還沒有任何題庫，點右上角設定新增一份。
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 畫面：題庫詳情（開始作答/錯題本/統計入口） ---------- */

function SetHomeScreen({ set, progress, onStart, onReview, onStats, onBack }) {
  const typeCount = {};
  for (const q of set.questions) {
    const t = q.type || "single";
    typeCount[t] = (typeCount[t] || 0) + 1;
  }
  const typeSummary = Object.entries(typeCount)
    .map(([t, c]) => `${QUESTION_TYPE_LABELS[t] || t} ${c}題`)
    .join(" ・ ");

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-12 pb-8">
        <button onClick={onBack} className="text-sm text-[#999] font-mono mb-6">← 換一份題庫</button>
        <div className="mb-10">
          <div className="text-xs tracking-[0.25em] text-[#9a3324] font-mono mb-2">
            {set.meta.examLabel || "大學學科能力測驗"} ・ {set.meta.year}年度 ・ {set.meta.subjectLabel}科
          </div>
          <div className="h-px bg-[#1a1a1a] mt-4 rounded-2xl" />
        </div>

        <button
          onClick={onStart}
          className="group relative w-full bg-[#9a3324] text-[#faf9f6] rounded-2xl py-5 px-6 mb-4 flex items-center justify-between transition-transform active:scale-[0.98]"
        >
          <div className="text-left">
            <div className="text-lg font-semibold">開始作答</div>
            <div className="text-xs text-[#ddd] font-mono mt-1">共 {set.questions.length} 題 ・ {typeSummary}</div>
          </div>
          <span className="text-2xl">→</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onReview} className="border border-[#1a1a1a] py-4 px-4 text-left active:bg-[#eee] transition-colors rounded-2xl">
            <div className="text-2xl font-mono font-bold text-[#9a3324]">{progress.wrongIds.length}</div>
            <div className="text-xs text-[#555] mt-1">錯題本</div>
          </button>
          <button onClick={onStats} className="border border-[#1a1a1a] py-4 px-4 text-left active:bg-[#eee] transition-colors rounded-2xl">
            <div className="text-2xl font-mono font-bold text-[#1a1a1a]">統計</div>
            <div className="text-xs text-[#555] mt-1">作答紀錄</div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 作答輸入元件（依題型分流） ---------- */

function SingleChoiceInput({ m, selected, onAnswer, mode }) {
  const optionKeys = m.optionLabels || Object.keys(m.options || {});
  const isCorrect = selected === m.correctAnswer;
  return (
    <div className="space-y-2">
      {optionKeys.map((opt) => {
        const isSelected = selected === opt;
        const isAnswer = m.correctAnswer === opt;
        let style = "border-[#ccc] bg-white text-[#1a1a1a]";
        if (mode === "answering") {
          if (isSelected) style = "border-[#2b6cb0] bg-[#eaf2fb] text-[#1a1a1a]";
        } else if (mode === "graded") {
          if (isAnswer) style = "border-[#2f6b3a] bg-[#eef6ed] text-[#1a1a1a]";
          else if (isSelected && !isCorrect) style = "border-[#9a3324] bg-[#faeae7] text-[#1a1a1a]";
        }
        const optImage = m.optionImages && m.optionImages[opt];
        const clickable = mode === "answering";
        return (
          <button
            key={opt}
            onClick={clickable ? () => onAnswer(opt) : undefined}
            disabled={!clickable}
            className={`w-full text-left border px-4 py-3 flex gap-3 transition-colors ${style} ${!clickable ? "cursor-default" : ""} rounded-2xl`}
          >
            <span className="font-mono font-bold shrink-0">{opt}</span>
            {optImage ? (
              <img src={optImage} alt={`選項${opt}`} className="max-h-24 object-contain" />
            ) : (
              <span className="text-sm leading-relaxed">{m.options[opt]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MultipleChoiceInput({ m, selected, onAnswer, mode }) {
  const optionKeys = m.optionLabels || Object.keys(m.options || {});
  const selectedArr = Array.isArray(selected) ? selected : [];
  const correctSet = new Set(Array.isArray(m.correctAnswer) ? m.correctAnswer : [m.correctAnswer]);
  const selectedSet = new Set(selectedArr);

  const toggle = (opt) => {
    if (selectedSet.has(opt)) {
      onAnswer(selectedArr.filter((o) => o !== opt));
    } else {
      onAnswer([...selectedArr, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-[#999] font-mono mb-1">多選題・可選一個以上選項</div>
      {optionKeys.map((opt) => {
        const isSelected = selectedSet.has(opt);
        const isCorrectOpt = correctSet.has(opt);
        let style = "border-[#ccc] bg-white text-[#1a1a1a]";
        let badge = null;

        if (mode === "answering") {
          if (isSelected) style = "border-[#2b6cb0] bg-[#eaf2fb] text-[#1a1a1a]";
        } else if (mode === "graded") {
          if (isCorrectOpt && isSelected) {
            style = "border-[#2f6b3a] bg-[#eef6ed] text-[#1a1a1a]";
          } else if (isCorrectOpt && !isSelected) {
            style = "border-[#b8860b] bg-[#fdf6e3] text-[#1a1a1a]";
            badge = "漏選";
          } else if (!isCorrectOpt && isSelected) {
            style = "border-[#9a3324] bg-[#faeae7] text-[#1a1a1a]";
            badge = "多選";
          }
        }

        const optImage = m.optionImages && m.optionImages[opt];
        const clickable = mode === "answering";

        return (
          <button
            key={opt}
            onClick={clickable ? () => toggle(opt) : undefined}
            disabled={!clickable}
            className={`w-full text-left border px-4 py-3 flex gap-3 items-start transition-colors ${style} ${!clickable ? "cursor-default" : ""} rounded-2xl`}
          >
            <span className="font-mono font-bold shrink-0 flex items-center gap-1">
              {clickable && (
                <span
                  className={`inline-block w-3.5 h-3.5 border rounded-sm ${
                    isSelected ? "bg-[#2b6cb0] border-[#2b6cb0]" : "border-[#999]"
                  }`}
                />
              )}
              {opt}
            </span>
            <span className="text-sm leading-relaxed flex-1">
              {optImage ? <img src={optImage} alt={`選項${opt}`} className="max-h-24 object-contain" /> : m.options[opt]}
            </span>
            {badge && <span className="text-[10px] font-mono shrink-0 mt-0.5">{badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

function FillBlankInput({ m, selected, onAnswer, mode }) {
  const blanks = m.blanks && m.blanks.length > 0 ? m.blanks : [m.questionNumber];
  const correctArr = Array.isArray(m.correctAnswer) ? m.correctAnswer : [m.correctAnswer];
  const values = Array.isArray(selected) ? selected : blanks.map(() => "");

  const setBlank = (i, v) => {
    const next = [...values];
    next[i] = v;
    onAnswer(next);
  };

  return (
    <div className="space-y-2">
      {blanks.map((label, i) => {
        const val = values[i] || "";
        const correctVal = correctArr[i];
        const isCorrect = mode === "graded" && val.trim().replace(/\s+/g, "") === String(correctVal ?? "").trim().replace(/\s+/g, "");
        let boxStyle = "border-[#ccc]";
        if (mode === "graded") boxStyle = isCorrect ? "border-[#2f6b3a] bg-[#eef6ed]" : "border-[#9a3324] bg-[#faeae7]";

        return (
          <div key={label} className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#9a3324] w-14 shrink-0">{label}</span>
            {mode === "answering" ? (
              <input
                type="text"
                value={val}
                onChange={(e) => setBlank(i, e.target.value)}
                placeholder="輸入答案"
                className={`flex-1 border ${boxStyle} rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2b6cb0]`}
              />
            ) : (
              <div className={`flex-1 border ${boxStyle} rounded-xl px-3 py-2 text-sm font-mono flex items-center justify-between`}>
                <span>你的答案：{val || "（空白）"}</span>
                {!isCorrect && <span className="text-[#2f6b3a]">正解：{correctVal}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EssayInput({ m, selected, onAnswer, mode }) {
  return (
    <div>
      <div className="text-[11px] text-[#b8860b] font-mono mb-2 bg-[#fdf6e3] border border-[#b8860b] rounded-xl px-3 py-2">
        非選擇題／混合題型手寫部分・不自動批改，僅供練習對答案
      </div>
      {mode === "answering" ? (
        <textarea
          value={selected || ""}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="可在此打草稿（非必填，交卷後對答案）"
          rows={4}
          className="w-full border border-[#ccc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2b6cb0]"
        />
      ) : (
        <div className="space-y-2">
          {selected && (
            <div className="border border-[#ccc] rounded-xl px-3 py-2 text-sm bg-white">
              <div className="text-[10px] text-[#999] font-mono mb-1">你的草稿</div>
              {selected}
            </div>
          )}
          <div className="border border-[#2f6b3a] bg-[#eef6ed] rounded-xl px-3 py-2 text-sm">
            <div className="text-[10px] text-[#2f6b3a] font-mono mb-1">參考答案 / 詳解</div>
            {m.referenceAnswer || "（尚未提供參考答案）"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 共用元件：題組/單題卡片（作答中與結果頁共用渲染邏輯） ---------- */

function QuestionInput({ m, selected, onAnswer, mode }) {
  const type = m.type || "single";
  if (type === "multiple") return <MultipleChoiceInput m={m} selected={selected} onAnswer={onAnswer} mode={mode} />;
  if (type === "fill") return <FillBlankInput m={m} selected={selected} onAnswer={onAnswer} mode={mode} />;
  if (type === "essay") return <EssayInput m={m} selected={selected} onAnswer={onAnswer} mode={mode} />;
  return <SingleChoiceInput m={m} selected={selected} onAnswer={onAnswer} mode={mode} />;
}

function GroupCard({ group, selections, onChoose, mode }) {
  // mode: "answering"（可作答） | "graded"（唯讀，顯示對錯與詳解）
  return (
    <div>
      {group.isGroup && (
        <div className="mb-4 pb-4 border-b border-dashed border-[#ccc]">
          <div className="text-xs font-mono text-[#9a3324] mb-2">
            題組 ・ 第{group.members[0].questionNumber}~{group.members[group.members.length - 1].questionNumber}題共用
          </div>
          <p className="text-[#1a1a1a] leading-relaxed text-[15px]">{group.sharedIntro}</p>
        </div>
      )}

      {group.sharedImage && (
        <div className="mb-4 border border-[#e5e2da] bg-white p-2 rounded-xl">
          <img src={group.sharedImage} alt="題目附圖" className="w-full" />
        </div>
      )}

      {group.members.map((m) => {
        const type = m.type || "single";
        const selected = selections[m.questionNumber];
        const gradeResult = mode === "graded" ? gradeQuestion(m, selected) : null;

        return (
          <div key={m.questionNumber} className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="font-mono text-xl font-bold text-[#9a3324] shrink-0 leading-none">
                {String(m.questionNumber).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono border border-[#999] text-[#999] rounded-full px-1.5 py-0.5">
                    {QUESTION_TYPE_LABELS[type] || type}
                  </span>
                  {m.score !== undefined && type !== "essay" && (
                    <span className="text-[10px] font-mono text-[#999]">{m.score}分</span>
                  )}
                </div>
                <p className="text-[#1a1a1a] leading-relaxed text-[15px]">{m.ownStem}</p>
              </div>
            </div>

            {!group.isGroup && m.image && (
              <div className="mb-3 border border-[#e5e2da] bg-white p-2 rounded-xl">
                <img src={m.image} alt={`第${m.questionNumber}題附圖`} className="w-full" />
              </div>
            )}

            <QuestionInput
              m={m}
              selected={selected}
              onAnswer={(val) => onChoose(m.questionNumber, val)}
              mode={mode}
            />

            {mode === "graded" && gradeResult && !gradeResult.ungraded && (
              <div className="mt-2 text-xs font-mono text-[#555]">
                得分 <b className={gradeResult.isCorrect ? "text-[#2f6b3a]" : "text-[#9a3324]"}>{gradeResult.earned}</b> / {gradeResult.max}
              </div>
            )}

            {mode === "graded" && m.needsReview && (
              <div className="text-xs text-[#9a3324] bg-[#faeae7] border border-[#9a3324] px-3 py-2 mt-2 rounded-xl">
                ⚠ 此題部分內容為圖片，文字僅供參考。
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 畫面：作答中（自由瀏覽＋最後統一交卷） ---------- */

function needsAnswerType(type) {
  return type !== "essay";
}

function isMemberAnswered(m, selections) {
  const val = selections[m.questionNumber];
  const type = m.type || "single";
  if (type === "essay") return true; // 非選擇題選填，不列入「未作答」提醒
  if (type === "multiple") return Array.isArray(val) && val.length > 0;
  if (type === "fill") return Array.isArray(val) ? val.some((v) => v && String(v).trim()) : !!val;
  return !!val;
}

function QuizScreen({ groups, initialSelections, onSubmit, onExit }) {
  const [idx, setIdx] = useState(0);
  const [selections, setSelections] = useState(initialSelections || {});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const group = groups[idx];
  const total = groups.length;

  const choose = (questionNumber, val) => {
    setSelections((prev) => ({ ...prev, [questionNumber]: val }));
  };

  const requiredMembers = groups.flatMap((g) => g.members.filter((m) => needsAnswerType(m.type || "single")));
  const answeredRequiredCount = requiredMembers.filter((m) => isMemberAnswered(m, selections)).length;
  const totalRequiredCount = requiredMembers.length;
  const isGroupAnswered = (g) => g.members.every((m) => isMemberAnswered(m, selections));

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(total - 1, i + 1));
  const jumpTo = (groupIdx) => setIdx(groupIdx);

  const handleSubmitClick = () => {
    if (answeredRequiredCount < totalRequiredCount) {
      setShowSubmitConfirm(true);
    } else {
      onSubmit(selections);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onExit} className="text-sm text-[#999] font-mono">✕ 結束</button>
          <div className="text-sm font-mono text-[#555]">已作答 {answeredRequiredCount} / {totalRequiredCount}</div>
        </div>

        {/* 題目導覽網格：可跳題 */}
        <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-[#e5e2da]">
          {groups.map((g, i) => {
            const answered = isGroupAnswered(g);
            const isCurrent = i === idx;
            const label = g.members.length > 1
              ? `${g.members[0].questionNumber}-${g.members[g.members.length - 1].questionNumber}`
              : `${g.members[0].questionNumber}`;
            let style = "border-[#ccc] text-[#999] bg-white";
            if (answered) style = "border-[#2b6cb0] text-[#2b6cb0] bg-[#eaf2fb]";
            if (isCurrent) style = "border-[#1a1a1a] text-[#1a1a1a] bg-[#1a1a1a] !text-white";
            return (
              <button
                key={g.groupId || g.members[0].questionNumber}
                onClick={() => jumpTo(i)}
                className={`text-xs font-mono border px-2 py-1 min-w-[32px] transition-colors ${style}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          <GroupCard group={group} selections={selections} onChoose={choose} mode="answering" />
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              disabled={idx === 0}
              className="flex-1 border border-[#1a1a1a] disabled:border-[#ddd] disabled:text-[#ccc] text-[#1a1a1a] py-3 font-semibold rounded-2xl transition-colors"
            >
              ← 上一題
            </button>
            <button
              onClick={goNext}
              disabled={idx === total - 1}
              className="flex-1 border border-[#1a1a1a] disabled:border-[#ddd] disabled:text-[#ccc] text-[#1a1a1a] py-3 font-semibold rounded-2xl transition-colors"
            >
              下一題 →
            </button>
          </div>
          <button
            onClick={handleSubmitClick}
            className="w-full bg-[#9a3324] text-[#faf9f6] py-4 font-semibold rounded-2xl transition-colors"
          >
            交卷
          </button>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
          <div className="bg-[#faf9f6] max-w-sm w-full p-6 border border-[#1a1a1a] rounded-2xl">
            <p className="text-[#1a1a1a] font-semibold mb-2">還有 {totalRequiredCount - answeredRequiredCount} 題沒作答</p>
            <p className="text-sm text-[#666] mb-6">確定要直接交卷嗎？沒作答的題目會算答錯（非選擇題不受影響）。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-[#1a1a1a] text-[#1a1a1a] py-3 font-semibold rounded-2xl"
              >
                繼續作答
              </button>
              <button
                onClick={() => onSubmit(selections)}
                className="flex-1 bg-[#9a3324] text-[#faf9f6] py-3 font-semibold rounded-2xl"
              >
                直接交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 畫面：結果 ---------- */

function useMemoWrongGroups(set, wrongQNumberSet) {
  return React.useMemo(() => {
    const allGroups = groupQuestions(set.questions);
    return allGroups
      .map((g) => ({ ...g, members: g.members.filter((m) => wrongQNumberSet.has(m.questionNumber)) }))
      .filter((g) => g.members.length > 0);
  }, [set, wrongQNumberSet]);
}

function ResultScreen({ set, answers, scoreMode, onScoreModeChange, onBackHome, onReviewWrong }) {
  const scoreResult = React.useMemo(() => computeSetScore(set.questions, answers), [set, answers]);
  const levelScale = getLevelScale(set.meta.year, set.meta.subject);
  const levelResult = levelScale ? estimateLevel(scoreResult.earnedScore, scoreResult.maxScore, levelScale) : null;

  const wrongQNumberSet = new Set(
    set.questions
      .filter((q) => {
        const r = scoreResult.perQuestion[q.questionNumber];
        return r && !r.ungraded && !r.isCorrect;
      })
      .map((q) => q.questionNumber)
  );
  const wrongGroups = useMemoWrongGroups(set, wrongQNumberSet);
  const effectiveMode = scoreMode === "level" && levelResult ? "level" : "rate";

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <div className="max-w-md mx-auto w-full px-6 pt-12 pb-8 flex-1 flex flex-col">
        <div className="text-xs tracking-[0.25em] text-[#9a3324] font-mono mb-2">作答結果</div>

        <ScoreModeToggle mode={scoreMode} onChange={onScoreModeChange} levelAvailable={!!levelResult} />

        {effectiveMode === "rate" ? (
          <div className="flex items-end gap-3 mb-2">
            <span className="text-6xl font-mono font-bold text-[#1a1a1a]">{scoreResult.accuracyRate}</span>
            <span className="text-2xl font-mono text-[#999] pb-1">%</span>
          </div>
        ) : (
          <div className="flex items-end gap-3 mb-2">
            <span className="text-6xl font-mono font-bold text-[#1a1a1a]">{levelResult.level}</span>
            <span className="text-2xl font-mono text-[#999] pb-1">級分</span>
          </div>
        )}

        {effectiveMode === "level" && (
          <div className="text-[11px] text-[#b8860b] font-mono mb-2 bg-[#fdf6e3] border border-[#b8860b] rounded-xl px-3 py-2">
            估算級分僅供參考，非大考中心官方成績。{levelResult.source ? `（依據：${levelResult.source}）` : ""}
          </div>
        )}

        <div className="flex gap-4 text-sm font-mono text-[#555] mb-2 pb-6 border-b border-dashed border-[#ccc]">
          <span>得分 <b className="text-[#1a1a1a]">{scoreResult.earnedScore}</b> / {scoreResult.maxScore}</span>
          <span>答對 <b className="text-[#2f6b3a]">{scoreResult.correctCount}</b> / {scoreResult.gradedQuestionCount}</span>
        </div>
        {scoreResult.ungradedCount > 0 && (
          <div className="text-xs text-[#999] mb-8">
            另有 {scoreResult.ungradedCount} 題非選擇題未計入分數，交卷結果僅供對答案參考。
          </div>
        )}

        {wrongGroups.length > 0 && (
          <div className="mb-8 mt-2">
            <div className="text-sm font-semibold text-[#1a1a1a] mb-4">錯題詳解</div>
            {wrongGroups.map((g) => (
              <div key={g.groupId || g.members[0].questionNumber} className="mb-6 pb-6 border-b border-[#e5e2da]">
                <GroupCard group={g} selections={answers} onChoose={() => {}} mode="graded" />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-2">
          {wrongGroups.length > 0 && (
            <button onClick={onReviewWrong} className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-4 font-semibold rounded-2xl">
              查看錯題本
            </button>
          )}
          <button onClick={onBackHome} className="w-full bg-[#9a3324] text-[#faf9f6] py-4 font-semibold rounded-2xl">
            回題庫首頁
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 畫面：錯題本 ---------- */

function WrongBookScreen({ set, wrongIds, onBack, onPractice }) {
  const wrongQs = set.questions.filter((q) => wrongIds.includes(q.questionNumber));

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-md mx-auto w-full px-6 pt-12 pb-8">
        <button onClick={onBack} className="text-sm text-[#999] font-mono mb-6">← 返回</button>
        <div className="text-xs tracking-[0.25em] text-[#9a3324] font-mono mb-2">錯題本</div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'Noto Serif TC', serif" }}>
          累積錯題 {wrongQs.length} 題
        </h2>

        {wrongQs.length === 0 ? (
          <div className="text-center py-16 text-[#999]">
            <p className="text-sm">目前沒有錯題紀錄。</p>
          </div>
        ) : (
          <>
            <button onClick={() => onPractice(wrongQs)} className="w-full bg-[#9a3324] text-[#faf9f6] py-4 font-semibold mb-6 rounded-2xl">
              重新練習這 {wrongQs.length} 題 →
            </button>
            <div className="space-y-3">
              {wrongQs.map((q) => (
                <div key={q.questionNumber} className="border border-[#e5e2da] bg-white p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-[#9a3324]">第{q.questionNumber}題</span>
                    <span className="text-[10px] font-mono border border-[#999] text-[#999] rounded-full px-1.5 py-0.5">
                      {QUESTION_TYPE_LABELS[q.type || "single"]}
                    </span>
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed line-clamp-2">{q.stem}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 畫面：統計 ---------- */

function StatsScreen({ history, onBack }) {
  const totalAnswered = history.reduce((sum, h) => sum + h.total, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-md mx-auto w-full px-6 pt-12 pb-8">
        <button onClick={onBack} className="text-sm text-[#999] font-mono mb-6">← 返回</button>
        <div className="text-xs tracking-[0.25em] text-[#9a3324] font-mono mb-2">作答統計</div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6" style={{ fontFamily: "'Noto Serif TC', serif" }}>
          整體表現
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-[#1a1a1a] p-4 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-[#1a1a1a]">{history.length}</div>
            <div className="text-xs text-[#666] mt-1">測驗次數</div>
          </div>
          <div className="border border-[#1a1a1a] p-4 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-[#1a1a1a]">{totalAnswered}</div>
            <div className="text-xs text-[#666] mt-1">作答題數</div>
          </div>
          <div className="border border-[#1a1a1a] p-4 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-[#9a3324]">{overallRate}%</div>
            <div className="text-xs text-[#666] mt-1">答對率</div>
          </div>
        </div>
        <div className="text-sm font-semibold text-[#1a1a1a] mb-3">測驗紀錄</div>
        {history.length === 0 ? (
          <div className="text-center py-12 text-[#999] text-sm">尚無作答紀錄。</div>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#e5e2da] py-3">
                <div className="text-sm text-[#555]">
                  {new Date(h.date).toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                </div>
                <div className="font-mono text-sm">
                  <span className="text-[#1a1a1a] font-bold">{h.correct}</span>
                  <span className="text-[#999]"> / {h.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 主應用 ---------- */

export default function QuizApp() {
  const { state: progressState, loaded: progressLoaded, save: saveProgress } = useProgress();
  const [customSets, setCustomSets] = useState(null);
  const [screen, setScreen] = useState("library"); // library | settings | setHome | quiz | result | wrongbook | stats
  const [activeSet, setActiveSet] = useState(null);
  const [activeGroups, setActiveGroups] = useState(null);
  const [lastAnswers, setLastAnswers] = useState({});
  const [practiceMode, setPracticeMode] = useState(false);
  const [scoreMode, setScoreMode] = useScoreMode();

  useEffect(() => {
    loadCustomQuizSets().then(setCustomSets);
  }, []);

  if (!progressLoaded || customSets === null) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="font-mono text-sm text-[#999]">載入中…</div>
      </div>
    );
  }

  const builtinSets = getBuiltinQuizSets(BUILTIN_MODULES);
  const allSets = [...builtinSets, ...customSets];

  const handleAddCustomSet = async (newSet) => {
    const next = [...customSets, newSet];
    setCustomSets(next);
    await saveCustomQuizSets(next);
  };

  const handleDeleteCustomSet = async (id) => {
    const next = customSets.filter((s) => s.id !== id);
    setCustomSets(next);
    await saveCustomQuizSets(next);
  };

  const handleSelectSet = (set) => {
    setActiveSet(set);
    setScreen("setHome");
  };

  const startQuiz = (questions) => {
    setActiveGroups(groupQuestions(questions));
    setPracticeMode(questions.length < activeSet.questions.length);
    setLastAnswers({});
    setScreen("quiz");
  };

  const handleFinish = async (answers) => {
    setLastAnswers(answers);
    const setProgress = getSetProgress(progressState, activeSet.id);
    const scoreResult = computeSetScore(activeSet.questions, answers);

    const gradedQNumbers = activeSet.questions
      .filter((q) => !scoreResult.perQuestion[q.questionNumber]?.ungraded)
      .map((q) => q.questionNumber);
    const correctedIds = gradedQNumbers.filter((qn) => scoreResult.perQuestion[qn]?.isCorrect);
    const newWrongIds = gradedQNumbers.filter((qn) => !scoreResult.perQuestion[qn]?.isCorrect);
    const mergedWrong = Array.from(
      new Set([...setProgress.wrongIds.filter((id) => !correctedIds.includes(id)), ...newWrongIds])
    );

    // 練習模式（錯題重練）不計入正式統計歷史，只更新錯題本
    const newHistory = practiceMode
      ? setProgress.history
      : [...setProgress.history, { date: new Date().toISOString(), correct: scoreResult.correctCount, total: scoreResult.gradedQuestionCount }];

    saveProgress({
      ...progressState,
      [activeSet.id]: { wrongIds: mergedWrong, history: newHistory },
    });
    setScreen("result");
  };

  const currentSetProgress = activeSet ? getSetProgress(progressState, activeSet.id) : null;

  return (
    <>
      {screen === "library" && (
        <LibraryScreen
          quizSets={allSets}
          progressState={progressState}
          onSelectSet={handleSelectSet}
          onOpenSettings={() => setScreen("settings")}
        />
      )}
      {screen === "settings" && (
        <SettingsScreen
          quizSets={allSets}
          customSets={customSets}
          onAddCustomSet={handleAddCustomSet}
          onDeleteCustomSet={handleDeleteCustomSet}
          onBack={() => setScreen("library")}
        />
      )}
      {screen === "setHome" && activeSet && (
        <SetHomeScreen
          set={activeSet}
          progress={currentSetProgress}
          onStart={() => startQuiz(activeSet.questions)}
          onReview={() => setScreen("wrongbook")}
          onStats={() => setScreen("stats")}
          onBack={() => setScreen("library")}
        />
      )}
      {screen === "quiz" && activeGroups && (
        <QuizScreen
          groups={activeGroups}
          initialSelections={lastAnswers}
          onSubmit={handleFinish}
          onExit={() => setScreen("setHome")}
        />
      )}
      {screen === "result" && activeSet && (
        <ResultScreen
          set={activeSet}
          answers={lastAnswers}
          scoreMode={scoreMode}
          onScoreModeChange={setScoreMode}
          onBackHome={() => setScreen("setHome")}
          onReviewWrong={() => setScreen("wrongbook")}
        />
      )}
      {screen === "wrongbook" && activeSet && currentSetProgress && (
        <WrongBookScreen
          set={activeSet}
          wrongIds={currentSetProgress.wrongIds}
          onBack={() => setScreen("setHome")}
          onPractice={(qs) => startQuiz(qs)}
        />
      )}
      {screen === "stats" && currentSetProgress && (
        <StatsScreen history={currentSetProgress.history} onBack={() => setScreen("setHome")} />
      )}
    </>
  );
}
