export const meta = {
  exam: "gsat",
  year: 111,
  subject: "mathA",
  subjectLabel: "數學A",
  examLabel: "大學學科能力測驗",
};

export const questions = [
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 1, groupId: "1", type: "single",
    stem: "某冰淇淋店最少需準備 n 桶不同口味的冰淇淋，才能滿足廣告所稱「任選兩球不同口味冰淇淋的組合數超過100種」。試問來店顧客從 n 桶中任選兩球（可為同一口味）共有幾種方法？",
    options: { A: "101", B: "105", C: "115", D: "120", E: "225" },
    correctAnswer: "D", score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 2, groupId: "2", type: "single",
    stem: "某品牌計算機在計算對數 logₐb 時需按「log(a,b)」輸入。某生在計算 logₐb 時（其中 a>1 且 b>1）順序弄錯，誤按「log(b,a)」，所得為正確值的 4/9 倍。試選出 a、b 間的關係式。",
    options: { A: "a²=b³", B: "a³=b²", C: "a⁴=b⁹", D: "a²=b³（同選項A，原PDF此處排版重複需人工核對）", E: "a³=b²（同選項B，原PDF此處排版重複需人工核對）" },
    correctAnswer: "A", score: 5,
    needsReview: true, reviewNote: "PDF文字擷取時選項的上標指數位置跑掉，選項(1)(4)、(2)(5)文字擷取結果重複，需對照原PDF圖片校對正確的指數關係式。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 3, groupId: "3", type: "single",
    stem: "在處理二維數據時，有種方法是將數據垂直投影到某一直線，並以該直線為數線，進而了解投影點所成一維數據的變異。下圖的一組二維數據，試問投影到哪一選項的直線，所得之一維投影數據的變異數會是最小？",
    options: { A: "y = -x + 2", B: "y = x + 2", C: "y = x", D: "y = -x/2", E: "y = x/2" },
    correctAnswer: "E", score: 5, hasStemImage: true,
    needsReview: true, reviewNote: "本題附有散佈圖，文字擷取無法取得圖片，需用截圖工具補上題幹圖片。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 4, groupId: "4", type: "single",
    stem: "設等差數列 aₙ 之首項 a₁ 與公差 d 皆為正數，且 log a₁, log a₃, log a₆ 依序也成等差數列。試選出數列 log a₁, log a₃, log a₆ 的公差。",
    options: { A: "log d", B: "(2/3) log d", C: "(3/2) log d", D: "log 2d", E: "log 3d" },
    correctAnswer: "C", score: 5,
    needsReview: true, reviewNote: "選項(2)(3)原文為分式（2/3 log d 等），PDF擷取時分式排版可能不準確，建議核對原圖。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 5, groupId: "5", type: "single",
    stem: "已知某地區有30%的人口感染某傳染病。針對該傳染病的快篩試劑檢驗，有陽性或陰性兩結果。已知該試劑將染病者判為陽性的機率為80%，將未染病者判為陰性的機率則為60%。為降低該試劑將染病者誤判為陰性的情況，專家建議連續採檢三次。若單次採檢判為陰性者中，染病者的機率為P；而連續採檢三次皆判為陰性者中，染病者的機率為P'。試問 P'/P 最接近哪一選項？",
    options: { A: "7", B: "8", C: "9", D: "10", E: "11" },
    correctAnswer: "B", score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 6, groupId: "6", type: "single",
    stem: "設坐標平面上兩直線 L₁、L₂ 的斜率皆為正，且 L₁、L₂ 有一夾角的平分線斜率為 11/9。另一直線 L 通過點 (1/2, 3) 且與 L₁、L₂ 所圍的有界區域為正三角形，試問 L 的方程式為下列哪一選項？",
    options: {
      A: "11x - 9y = 19", B: "9x - 11y = 25", C: "11x - 9y = 25",
      D: "27x - 33y = 43", E: "27x - 33y = 65",
    },
    correctAnswer: "E", score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 7, groupId: "7", type: "multiple",
    stem: "設整數 n 滿足 |5n - 21| < 7n。試選出正確的選項。",
    options: {
      A: "5n < 7n + 21", B: "-1 < 1/(5n) < 1/21（原式需核對）", C: "7n < 5n + 21",
      D: "2n² < (5n-21)² < 49n²（原式需核對）", E: "滿足題設不等式的整數 n 有無窮多個",
    },
    correctAnswer: ["B", "D"], optionCount: 5, score: 5,
    needsReview: true, reviewNote: "選項(2)(4)含分式與平方式，PDF文字擷取排版跑位，需對照原圖核對確切算式。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 8, groupId: "8", type: "multiple",
    stem: "坐標平面上，△ABC 三頂點的坐標分別為 A(0,2)、B(1,0)、C(4,1)，試選出正確的選項。",
    options: {
      A: "△ABC的三邊中，AC最長", B: "sin A < sin C", C: "△ABC為銳角三角形",
      D: "sin B = 7√2/10", E: "△ABC的外接圓半徑比2小",
    },
    correctAnswer: ["A", "D"], optionCount: 5, score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 9, groupId: "9", type: "multiple",
    stem: "已知 P 為 △ABC 內一點，且 向量AP = a·向量AB + b·向量AC，其中 a、b 為相異實數。設 Q、R 在同一平面上，且 向量AQ = b·向量AB + a·向量AC，向量AR = a·向量AB + (b-0.05)·向量AC。試選出正確的選項。",
    options: {
      A: "Q、R也都在△ABC內部", B: "|向量AP| = |向量AQ|", C: "△ABP面積 = △ACQ面積",
      D: "△BCP面積 = △BCQ面積", E: "△ABP面積 > △ABR面積",
    },
    correctAnswer: ["C", "D"], optionCount: 5, score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 10, groupId: "10", type: "multiple",
    stem: "給定一實係數三次多項式函數 f(x) = ax³ + bx² + cx + 3。令 g(x) = f(-x) - 3，已知 y = g(x) 圖形的對稱中心為 (1,0) 且 g(-1) < 0。試選出正確的選項。",
    options: {
      A: "g(x) = 0 有三相異整數根", B: "a < 0", C: "y = f(x) 圖形的對稱中心為 (-1,-3)",
      D: "f(100) < 0", E: "y = f(x) 的圖形在點 (-1, f(-1)) 附近會近似於一條斜率為 a 的直線",
    },
    correctAnswer: ["A", "B"], optionCount: 5, score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 11, groupId: "11", type: "multiple",
    stem: "下圖為一個積木的示意圖，其中 △ABC 為一直角三角形，∠ACB=90°，AC=5、BC=6，且 ADEB 與 ADFC 皆為矩形。試選出正確的選項。",
    options: {
      A: "將此積木沿平面ACE切下，可切得兩個四面體", B: "平面ADEB與ADFC所夾銳角大於45°",
      C: "∠CEB < ∠AEB", D: "tan∠AEC < sin∠CEB", E: "∠CEB < ∠AEC",
    },
    correctAnswer: ["B", "C", "D"], optionCount: 5, score: 5, hasStemImage: true,
    needsReview: true, reviewNote: "本題附有立體幾何示意圖，需用截圖工具補上圖片。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 12, groupId: "12", type: "multiple",
    stem: "設 f(x)、g(x) 皆為實係數多項式，其中 g(x) 是首項係數為正的二次式。已知 (g(x))² 除以 f(x) 的餘式為 g(x)，且 y=f(x) 的圖形與 x 軸無交點。試選出不可能是 y=g(x) 圖形頂點的 y 坐標之選項。",
    options: { A: "-2√2", B: "-1", C: "2", D: "2√2", E: "1/2" },
    correctAnswer: ["A", "B"], optionCount: 5, score: 5,
    needsReview: true, reviewNote: "選項(1)(4)含根號，需核對原圖確認正確數值。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 13, groupId: "13", type: "fill",
    stem: "有一款線上遊戲推出「十連抽」的抽卡機制，「十連抽」意思為系統自動做十次的抽卡動作。若每次「十連抽」需用1500枚代幣，抽中金卡的機率在前九次皆為2%，在第十次為10%。今某生有代幣23000枚，且不斷使用「十連抽」，抽到不能再抽為止。則某生抽到金卡張數的期望值為 13-1 . 13-2 張。",
    blanks: ["13-1", "13-2"], correctAnswer: ["4", "2"], score: 5,
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 14, groupId: "14", type: "fill",
    stem: "已知 a、b 為實數，且方程組 { ax+5y+12z=4, x+ay+8z=7/3, 3x+8y+az=1 } 恰有一組解，又此方程組經過一系列的高斯消去法運算後，原來的增廣矩陣可化為上三角形式（見原PDF）。則 a = 14-1 ，b = 14-2 / 14-3 （化為最簡分數）。",
    blanks: ["14-1", "14-2", "14-3"], correctAnswer: ["2", "1", "2"], score: 5,
    needsReview: true, reviewNote: "方程組與消去後的矩陣原文為圖片化排版，文字擷取不完整，需對照原PDF確認完整算式。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 15, groupId: "15", type: "fill",
    stem: "如圖，王家有塊三角形土地△ABC，其中 BC=16公尺。政府擬徵收其中梯形DBCE部分，開闢以直線DE、BC為邊線的馬路，其路寬為h公尺，這讓王家土地只剩原有面積的9/16。經協商，改以開闢平行直線BE、FC為邊線的馬路，且路寬不變，其中∠EBC=30°，則只需徵收△BCE區域。依此協商，王家剩餘的土地△ABE有 15-1 15-2 . 15-3 平方公尺。",
    blanks: ["15-1", "15-2", "15-3"], correctAnswer: ["1", "9", "2"], score: 5, hasStemImage: true,
    needsReview: true, reviewNote: "本題附有幾何示意圖，需用截圖工具補上圖片才能完整呈現。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 16, groupId: "16", type: "fill",
    stem: "坐標空間中，平面 x - y + 2z = 3 上有兩相異直線 L: (x-1)/2 = y+1 = -2z 與 L'。已知 L 也在另一平面 E 上，且 L' 在 E 的投影與 L 重合。則 E 的方程式為 x + 16-1 16-2 y + 16-3 16-4 z = 16-5 。",
    blanks: ["16-1", "16-2", "16-3", "16-4", "16-5"], correctAnswer: ["-", "3", "-", "2", "5"], score: 5,
    needsReview: true, reviewNote: "16-1、16-3格為正負號，其餘為數字，格式與原答案卷畫記方式一致，建議核對原PDF確認排列順序。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 17, groupId: "17", type: "fill",
    stem: "坐標空間中一平行六面體，某一底面的其中三頂點為 (-1,2,1)、(-4,1,3)、(2,0,-3)，另一面之一頂點在xy平面上且與原點距離為1。滿足前述條件之平行六面體中，最大體積為 17-1 17-2 。",
    blanks: ["17-1", "17-2"], correctAnswer: ["2", "1"], score: 5,
    needsReview: true, reviewNote: "答案格式可能為「係數×10^次方」或根號形式，需核對原答案卷格式確認17-1、17-2代表的意義。",
  },
  // 18-20 混合題組
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 18, groupId: "18-20", type: "single",
    stem: "坐標平面上有一環狀區域由圓 x²+y²=3 的外部與圓 x²+y²=4 的內部交集而成。某甲欲用一支長度為1的筆直掃描棒來掃描此環狀區域之x軸上方的某區域R。他設計掃描棒黑、白兩端分別在半圓 C₁: x²+y²=3(y≥0)、C₂: x²+y²=4(y≥0) 上移動。開始時掃描棒黑端在點 A(√3,0)，白端在C₂的點B。接著黑、白兩端各沿著C₁、C₂逆時針移動，直至白端碰到C₂的點B'(-2,0)便停止掃描。試問點B的坐標為下列哪一選項？（單選題，3分）",
    options: { A: "(0,2)", B: "(1,√3)", C: "(√2,√2)", D: "(√3,1)", E: "(2,0)" },
    correctAnswer: "D", score: 3, hasStemImage: true,
    needsReview: true, reviewNote: "本題組附有掃描棒移動示意圖，需用截圖工具補上圖片。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 19, groupId: "18-20", type: "essay",
    stem: "（承18題情境）令O為原點，掃描棒停止時黑、白兩端所在位置分別為A'、B'。試在答題卷上作圖區中以斜線標示掃描棒掃過的區域R；並於求解區內求 cos∠OA'B' 及點A'的極坐標。（非選擇題，6分）",
    score: 6, referenceAnswer: "",
    needsReview: true, reviewNote: "官方僅公告選擇（填）題答案，非選擇題大考中心未公布詳解／評分標準，需自行準備參考答案。",
  },
  {
    exam: "gsat", year: 111, subject: "mathA", questionNumber: 20, groupId: "18-20", type: "essay",
    stem: "（承19題）令Ω表示掃描棒在第一象限所掃過的區域，試分別求Ω與R的面積。（非選擇題，6分）",
    score: 6, referenceAnswer: "",
    needsReview: true, reviewNote: "官方僅公告選擇（填）題答案，非選擇題大考中心未公布詳解／評分標準，需自行準備參考答案。",
  },
];
