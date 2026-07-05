import { groupQuestions, validateQuizSetJson, SUBJECT_LABELS } from "../quizData.js";
import { computeSetScore, estimateLevel, gradeQuestion } from "../scoring.js";
import { sampleQuestions, sampleMeta } from "./gsat_mathb_sample.js";

let failures = 0;
function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`✗ FAIL ${label}: got ${a}, expected ${e}`);
    failures++;
  } else {
    console.log(`✓ ${label}`);
  }
}

// 1. Schema 驗證
const validation = validateQuizSetJson(JSON.stringify({ meta: sampleMeta, questions: sampleQuestions }));
assertEqual(validation.valid, true, "schema驗證：合成題庫應該通過驗證");

// 2. 題組分組：18-20應該合併成一組，1、8、13應各自獨立
const groups = groupQuestions(sampleQuestions);
assertEqual(groups.length, 4, "題組分組：應該有4個作答單位（1、8、13、18-20）");
const mixedGroup = groups.find((g) => g.groupId === "18-20");
assertEqual(mixedGroup.members.length, 3, "混合題組應包含18/19/20三小題");

// 3. 單選題計分
assertEqual(gradeQuestion(sampleQuestions[0], "B"), { earned: 5, max: 5, isCorrect: true, answered: true }, "單選題答對得滿分");
assertEqual(gradeQuestion(sampleQuestions[0], "A"), { earned: 0, max: 5, isCorrect: false, answered: true }, "單選題答錯得0分");

// 4. 多選題計分（官方公式 (n-2k)/n）
assertEqual(gradeQuestion(sampleQuestions[1], ["A", "C", "D"]).earned, 2, "多選題全對得滿分");
assertEqual(gradeQuestion(sampleQuestions[1], ["A", "B", "C", "D"]).earned, 1.2, "多選題錯1個選項 (5-2)/5*2=1.2");
assertEqual(gradeQuestion(sampleQuestions[1], ["C", "D", "E"]).earned, 0.4, "多選題錯2個選項 (5-4)/5*2=0.4");
assertEqual(gradeQuestion(sampleQuestions[1], ["A", "B"]).earned, 0, "多選題錯3個選項應為0分（不會負分）");

// 5. 選填題計分（全對才給分）
assertEqual(gradeQuestion(sampleQuestions[2], ["3", "8"]).earned, 5, "選填題全對得滿分");
assertEqual(gradeQuestion(sampleQuestions[2], ["3", "9"]).earned, 0, "選填題有一格錯就0分");
assertEqual(gradeQuestion(sampleQuestions[2], ["  3 ", "8"]).earned, 5, "選填題應忽略答案中的多餘空白");

// 6. 非選擇題不計分
const essayResult = gradeQuestion(sampleQuestions[4], "我的草稿內容");
assertEqual(essayResult.ungraded, true, "非選擇題應標記為不計分");
assertEqual(essayResult.earned, 0, "非選擇題earned應為0");

// 7. 整份計分（模擬考生作答）
const answers = {
  1: "B", // 對，5分
  8: ["A", "C", "D"], // 對，2分
  13: ["3", "8"], // 對，5分
  18: "A", // 對，5分
  19: "隨便寫的草稿",
  20: "",
};
const scoreResult = computeSetScore(sampleQuestions, answers);
assertEqual(scoreResult.earnedScore, 17, "整份得分應為 5+2+5+5=17（非選擇題不計入）");
assertEqual(scoreResult.maxScore, 17, "可計分滿分應為 5+2+5+5=17");
assertEqual(scoreResult.gradedQuestionCount, 4, "可自動批改題數應為4題");
assertEqual(scoreResult.ungradedCount, 2, "非選擇題應有2題");
assertEqual(scoreResult.correctCount, 4, "全對，答對數應為4");
assertEqual(scoreResult.accuracyRate, 100, "答對率應為100%");

// 8. 級分估算（沒有級距資料時應回傳null）
assertEqual(estimateLevel(17, 17, null), null, "沒有級距資料時應回傳null");
const fakeLevel = estimateLevel(80, 100, { interval: 6.83, source: "測試用假資料" });
console.log("級分估算範例（假資料）：", fakeLevel);

console.log(failures === 0 ? "\n全部測試通過 ✓" : `\n有 ${failures} 項測試失敗 ✗`);
process.exit(failures === 0 ? 0 : 1);
