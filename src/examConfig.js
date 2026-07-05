/* ---------- 級分估算設定 ----------
 *
 * 學測成績為「級分制」，官方換算公式：
 *   級距 = 該科到考前1%考生的平均原始總分 / 15（取到小數第二位）
 *   每滿一個級距，往上加1級分，最高15級分
 *
 * 級距數字每年每科不同，且需要大考中心公告的統計資料才能取得，
 * 沒有這份資料就無法還原級分，只能先留空。
 * 之後拿到官方公告的級距，可以照下面格式補進來：
 *
 *   "111-mathB": { interval: 6.83, source: "111學年度學測 數學B 級距（大考中心公告）" }
 *
 * key 格式為 `${year}-${subject}`。
 */
export const LEVEL_SCALE_TABLE = {
  // 尚無資料，補上後「估算級分」模式才能使用；目前沒有資料時畫面會顯示提示，不會顯示錯誤或亂數字。
};

export function getLevelScale(year, subject) {
  return LEVEL_SCALE_TABLE[`${year}-${subject}`] || null;
}
