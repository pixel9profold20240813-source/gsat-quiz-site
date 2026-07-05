/* ---------- 計分邏輯（純函式，方便獨立測試） ---------- */
//
// 支援題型：
//  - single  單選題：答對得滿分，答錯/未答得0分
//  - multiple 多選題：官方公式 (n-2k)/n，k=答錯選項數（多選或少選都算一個錯）
//  - fill    選填題：可拆多個空格，全對才給分，答錯不倒扣
//  - essay   非選擇題/混合題型的手寫部分：不自動批改，不計入分數統計

function normalizeStr(s) {
  return String(s ?? "").trim().replace(/\s+/g, "");
}

export function gradeSingle(question, answer) {
  const max = question.score ?? 1;
  if (!answer) return { earned: 0, max, isCorrect: false, answered: false };
  const isCorrect = answer === question.correctAnswer;
  return { earned: isCorrect ? max : 0, max, isCorrect, answered: true };
}

/**
 * 多選題計分：每題有 n 個選項，正確答案至少1個。
 * 全部答對（選答與應選完全相符）→ 得該題全部分數
 * 答錯 k 個選項 → 得該題 (n-2k)/n 之題分
 * 算出 < 0 或全部未作答 → 0分
 */
export function gradeMultiple(question, answerArr) {
  const max = question.score ?? 1;
  const selected = new Set(Array.isArray(answerArr) ? answerArr : []);
  const allOptions = question.optionLabels || Object.keys(question.options || {});
  const n = question.optionCount || allOptions.length;
  const correctSet = new Set(
    Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]
  );

  if (selected.size === 0) {
    return { earned: 0, max, isCorrect: false, answered: false, wrongCount: n };
  }

  let wrongCount = 0;
  for (const opt of allOptions) {
    const shouldSelect = correctSet.has(opt);
    const didSelect = selected.has(opt);
    if (shouldSelect !== didSelect) wrongCount++;
  }

  const isFullyCorrect = wrongCount === 0;
  let earned = isFullyCorrect ? max : ((n - 2 * wrongCount) / n) * max;
  earned = Math.max(0, Math.round(earned * 100) / 100);

  return { earned, max, isCorrect: isFullyCorrect, answered: true, wrongCount };
}

/**
 * 選填題：question.blanks 為空格標籤陣列（例如 ["13-1","13-2"]），
 * correctAnswer 對應為同長度陣列（單一空格時可以是純字串）。
 * 全對才給分，答錯不倒扣。
 */
export function gradeFill(question, answerBlanks) {
  const max = question.score ?? 1;
  const correctArr = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [question.correctAnswer];
  const answerArr = Array.isArray(answerBlanks) ? answerBlanks : [answerBlanks];

  const hasAnyAnswer = answerArr.some((a) => a !== undefined && a !== null && a !== "");
  if (!hasAnyAnswer) return { earned: 0, max, isCorrect: false, answered: false };

  const allCorrect =
    correctArr.length === answerArr.length &&
    correctArr.every((c, i) => normalizeStr(c) === normalizeStr(answerArr[i]));

  return { earned: allCorrect ? max : 0, max, isCorrect: allCorrect, answered: true };
}

// 非選擇題／混合題型的手寫部分：不批改，不計入分數統計，只用來顯示是否已作答（草稿）
export function gradeEssay(question, answerText) {
  return {
    earned: 0,
    max: 0,
    isCorrect: null,
    answered: !!(answerText && String(answerText).trim()),
    ungraded: true,
  };
}

export function gradeQuestion(question, answer) {
  switch (question.type) {
    case "multiple":
      return gradeMultiple(question, answer);
    case "fill":
      return gradeFill(question, answer);
    case "essay":
      return gradeEssay(question, answer);
    default:
      // "single" 或沒有標記 type（相容舊的會考題庫資料）
      return gradeSingle(question, answer);
  }
}

/**
 * 計算整份題庫的作答結果。
 * 回傳：
 *  - earnedScore / maxScore：只計算可自動批改的題目（single/multiple/fill）
 *  - accuracyRate：以「題數」為單位的答對率（多選題需完全答對才算對），非選擇題不列入計算
 *  - ungradedCount：非選擇題數量（essay），供畫面提示「尚有 N 題非選擇題未計入」
 */
export function computeSetScore(questions, answers) {
  let earned = 0;
  let max = 0;
  let correctCount = 0;
  let gradedQuestionCount = 0;
  let ungradedCount = 0;
  const perQuestion = {};

  for (const q of questions) {
    const result = gradeQuestion(q, answers[q.questionNumber]);
    perQuestion[q.questionNumber] = result;
    if (result.ungraded) {
      ungradedCount++;
    } else {
      earned += result.earned;
      max += result.max;
      gradedQuestionCount++;
      if (result.isCorrect) correctCount++;
    }
  }

  return {
    earnedScore: Math.round(earned * 100) / 100,
    maxScore: Math.round(max * 100) / 100,
    accuracyRate: gradedQuestionCount > 0 ? Math.round((correctCount / gradedQuestionCount) * 100) : 0,
    correctCount,
    gradedQuestionCount,
    ungradedCount,
    perQuestion,
  };
}

/**
 * 級分估算（非官方，僅供參考）。
 * 官方公式：級距 = 前1%到考生平均原始總分 / 15；每滿一個級距往上加1級分，最高15級分。
 * 這裡只能用「該科的級距」去粗略估算，級距數字必須由使用者/題庫提供（每年每科不同，
 * 需要大考中心公告的統計資料），沒有的話回傳 null，畫面上要顯示「無資料」。
 *
 * scale: { interval: number, source?: string }
 * earnedScore/maxScore: 使用者在「可自動批改題目」拿到的分數（未含非選擇題）
 */
export function estimateLevel(earnedScore, maxScore, scale) {
  if (!scale || !scale.interval || maxScore <= 0) return null;
  // 官方級距是以「滿分通常為100分」的原始成績為基礎，這裡等比例換算成滿分100
  const normalizedScore = (earnedScore / maxScore) * 100;
  const level = Math.max(0, Math.min(15, Math.floor(normalizedScore / scale.interval + 1e-9)));
  return {
    level,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    interval: scale.interval,
    source: scale.source || null,
  };
}
