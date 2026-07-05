# 大學學測刷題網站（數學B 原型）

## 本機開發
```
npm install
npm run dev
```

## 建置生產版本
```
npm install
npm run build
```
建置完成後，靜態檔案會輸出在 `dist/` 資料夾。

## 新增題庫

目前**沒有內建題庫**，需要點右上角設定圖示「⚙」，貼上用「截圖工具」+「合併工具」
產出的 `questions_merged.json` 完整內容才能開始使用。

每題需要標記 `type`（single/multiple/fill/essay）、`score`（該題配分）等欄位，
完整schema說明見 `docs/gemini_prompt_gsat_v1.txt`。

## 題型與計分

- 支援題型：單選、多選（官方 (n-2k)/n 公式計分）、選填（全對才給分）、
  非選擇題/混合題型（不自動批改，交卷後顯示參考答案供對答案）
- 計分呈現：可切換「答對率」或「估算級分」（級分為非官方粗略估算，
  需要在 `src/examConfig.js` 補上該年度該科的官方級距數字才能使用，
  沒有資料時該選項會顯示為無法選取）
- 邏輯測試：`src/test_fixtures/run_logic_test.mjs`，涵蓋schema驗證、題組分組、
  四種題型計分公式。修改計分邏輯後建議先跑一次：
  ```
  node src/test_fixtures/run_logic_test.mjs
  ```

## 更新日誌

### v1.0（學測數學B 原型，從 cap-quiz-site-v2 拆分出獨立版本）
- 支援題型：單選、多選（官方 (n-2k)/n 公式計分）、選填（全對才給分）、
  非選擇題/混合題型（不自動批改，交卷後顯示參考答案供對答案）
- 新增 `src/scoring.js` 獨立計分模組，多選題計分公式已對照官方範例驗證
- 新增雙計分模式（答對率 / 估算級分）
- 使用 `localStorage` 儲存自訂題庫與作答進度
- 目前沒有內建題庫，需自行透過設定頁上傳題庫
