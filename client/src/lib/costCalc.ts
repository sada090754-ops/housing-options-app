// =============================================================================
// costCalc.ts — 原価管理ページ用 計算ロジック
// ルール: お客様提示価格は利益率30%で設定
//   原価    = 提示価格 × 0.70
//   利益額  = 提示価格 − 原価
//   利益率  = 利益額 ÷ 提示価格 = 30%（固定）
// =============================================================================

export const MARGIN_RATE = 0.30; // 利益率 30%
export const COST_RATE   = 0.70; // 原価率 70%

export interface CostRow {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  itemId: string;
  itemName: string;
  unit: "fixed" | "per_tsubo" | "per_sqm";
  /** 単価（税抜・お客様提示） */
  unitPrice: number;
  /** 数量（坪/㎡。fixedは1） */
  quantity: number;
  /** お客様提示価格合計 */
  sellingTotal: number;
  /** 原価合計 */
  costTotal: number;
  /** 利益額合計 */
  profitTotal: number;
  /** 利益率（0〜1） */
  marginRate: number;
}

export function calcCostRow(
  unitPrice: number,
  quantity: number
): { sellingTotal: number; costTotal: number; profitTotal: number; marginRate: number } {
  const sellingTotal = unitPrice * quantity;
  const costTotal    = Math.round(sellingTotal * COST_RATE);
  const profitTotal  = sellingTotal - costTotal;
  const marginRate   = sellingTotal > 0 ? profitTotal / sellingTotal : 0;
  return { sellingTotal, costTotal, profitTotal, marginRate };
}

export interface CostSummary {
  sellingTotal: number;
  costTotal: number;
  profitTotal: number;
  marginRate: number;
}

export function calcSummary(rows: CostRow[]): CostSummary {
  const sellingTotal = rows.reduce((s, r) => s + r.sellingTotal, 0);
  const costTotal    = rows.reduce((s, r) => s + r.costTotal, 0);
  const profitTotal  = rows.reduce((s, r) => s + r.profitTotal, 0);
  const marginRate   = sellingTotal > 0 ? profitTotal / sellingTotal : 0;
  return { sellingTotal, costTotal, profitTotal, marginRate };
}
