// =============================================================================
// EstimateModal — 見積書風サマリーモーダル
// Design: Japanese Craft Modernism — Clean estimate sheet style
// =============================================================================

import { useRef } from "react";
import { X, Printer, Share2 } from "lucide-react";
import { formatPrice, type Category } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

interface SelectedEntry {
  item: { id: string; name: string; price: number; unit: string; categoryId: string };
  quantity: number;
  total: number;
}

interface EstimateModalProps {
  categories: Category[];
  open: boolean;
  onClose: () => void;
  selectedItems: SelectedEntry[];
  grandTotal: number;
  categoryTotals: Record<string, number>;
  onShareLINE: () => void;
}

export default function EstimateModal({
  categories,
  open,
  onClose,
  selectedItems,
  grandTotal,
  categoryTotals: _categoryTotals,
  onShareLINE,
}: EstimateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>住宅オプション見積書</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans JP', sans-serif; color: #1a1a1a; background: white; padding: 40px; }
          h1, h2, h3 { font-family: 'Noto Serif JP', serif; }
          .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 22px; font-weight: 700; }
          .header .date { font-size: 12px; color: #666; margin-top: 4px; }
          .category-section { margin-bottom: 24px; }
          .category-title { font-size: 13px; font-weight: 700; color: #333; border-left: 3px solid #C8A96E; padding-left: 10px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 11px; color: #888; text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
          td { font-size: 12px; padding: 8px 8px; border-bottom: 1px solid #f5f5f5; }
          td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
          .total-section { margin-top: 30px; border-top: 2px solid #1a1a1a; padding-top: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .total-row.grand { font-size: 18px; font-weight: 700; border-top: 1px solid #eee; padding-top: 12px; margin-top: 8px; }
          .gold { color: #C8A96E; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // カテゴリ別にグループ化
  const grouped = categories
    .map((cat) => ({
      cat,
      items: selectedItems.filter((e) => e.item.categoryId === cat.id),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-slide-in">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[16px] font-semibold">見積書プレビュー</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 見積書コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef}>
            {/* 見積書ヘッダー */}
            <div className="header border-b-2 border-foreground pb-5 mb-6">
              <h1 className="text-[22px] font-bold">住宅オプション 見積書</h1>
              <p className="date text-[12px] text-muted-foreground mt-1">
                作成日：{today}
              </p>
            </div>

            {/* カテゴリ別明細 */}
            {grouped.map(({ cat, items }) => (
              <div key={cat.id} className="category-section mb-6">
                <div className="category-title text-[13px] font-bold text-foreground/80 border-l-[3px] border-[oklch(0.72_0.13_75)] pl-2.5 mb-3">
                  {cat.icon} {cat.name}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-[11px] text-muted-foreground text-left py-1.5 px-2">
                        品目
                      </th>
                      <th className="text-[11px] text-muted-foreground text-right py-1.5 px-2">
                        単価
                      </th>
                      <th className="text-[11px] text-muted-foreground text-right py-1.5 px-2">
                        数量
                      </th>
                      <th className="text-[11px] text-muted-foreground text-right py-1.5 px-2">
                        金額
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ item, quantity, total }) => (
                      <tr key={item.id} className="border-b border-border/40">
                        <td className="text-[12.5px] py-2 px-2">{item.name}</td>
                        <td className="text-[12px] text-right py-2 px-2 price-badge">
                          {formatPrice(item.price)}円
                          {item.unit === "per_tsubo" && " /坪"}
                          {item.unit === "per_sqm" && " /㎡"}
                        </td>
                        <td className="text-[12px] text-right py-2 px-2 price-badge">
                          {item.unit !== "fixed" ? (
                            <>
                              {quantity}
                              {item.unit === "per_tsubo" ? "坪" : "㎡"}
                            </>
                          ) : (
                            "1式"
                          )}
                        </td>
                        <td className="text-[13px] font-semibold text-right py-2 px-2 price-badge text-[oklch(0.72_0.13_75)]">
                          {formatPrice(total)}円
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* 合計 */}
            <div className="total-section border-t-2 border-foreground pt-4 mt-4">
              <div className="flex justify-between py-1.5 text-[13px]">
                <span className="text-muted-foreground">小計（税抜）</span>
                <span className="price-badge font-medium">
                  {formatPrice(grandTotal)}円
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-[12px]">
                <span className="text-muted-foreground">消費税（10%）</span>
                <span className="price-badge text-muted-foreground">
                  {formatPrice(Math.round(grandTotal * 0.1))}円
                </span>
              </div>
              <div className="flex justify-between py-3 text-[18px] font-bold border-t border-border mt-2">
                <span>合計（税込）</span>
                <span className="price-badge text-[oklch(0.72_0.13_75)]">
                  {formatPrice(Math.round(grandTotal * 1.1))}円
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-6">
              ※ 本見積書は参考価格です。実際の金額は担当者にご確認ください。
            </p>
          </div>
        </div>

        {/* フッターボタン */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-semibold hover:bg-foreground/90 active:scale-[0.98] transition-all duration-150"
          >
            <Printer className="w-4 h-4" />
            印刷 / PDF保存
          </button>
          <button
            type="button"
            onClick={onShareLINE}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#06C755] text-white text-[13px] font-semibold hover:bg-[#05b04c] active:scale-[0.98] transition-all duration-150"
          >
            <Share2 className="w-4 h-4" />
            LINEで共有
          </button>
        </div>
      </div>
    </div>
  );
}
