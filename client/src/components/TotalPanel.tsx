// =============================================================================
// TotalPanel — 選択合計・見積もりサマリーパネル
// Design: Japanese Craft Modernism — Deep charcoal bg / Gold accent
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { FileText, Share2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/lib/optionsData";
import { categories } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

interface SelectedEntry {
  item: { id: string; name: string; price: number; unit: string; categoryId: string };
  quantity: number;
  total: number;
}

interface TotalPanelProps {
  selectedItems: SelectedEntry[];
  grandTotal: number;
  categoryTotals: Record<string, number>;
  onClearAll: () => void;
  onExportPDF: () => void;
  onShareLINE: () => void;
}

// カウントアップアニメーション
function useCountUp(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

export default function TotalPanel({
  selectedItems,
  grandTotal,
  categoryTotals,
  onClearAll,
  onExportPDF,
  onShareLINE,
}: TotalPanelProps) {
  const animatedTotal = useCountUp(grandTotal);
  const [showDetail, setShowDetail] = useState(false);

  const selectedCount = selectedItems.length;

  return (
    <div className="total-panel">
      {/* ── ヘッダー ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-[oklch(0.6_0.006_80)] uppercase tracking-widest font-medium">
            合計金額（税抜）
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[32px] font-bold price-badge leading-none text-[oklch(0.92_0.004_80)]">
              {formatPrice(animatedTotal)}
            </span>
            <span className="text-[14px] text-[oklch(0.6_0.006_80)]">円</span>
          </div>
        </div>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-[11px] text-[oklch(0.55_0.006_80)] hover:text-[oklch(0.7_0.006_80)] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            クリア
          </button>
        )}
      </div>

      {/* ── 選択件数 ── */}
      {selectedCount > 0 ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-[oklch(0.6_0.006_80)]">
              {selectedCount}件のオプションを選択中
            </span>
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-[oklch(0.72_0.13_75)] hover:text-[oklch(0.82_0.1_75)] transition-colors"
            >
              {showDetail ? (
                <>
                  閉じる <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  内訳 <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* ── カテゴリ別小計 ── */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              showDetail ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="border-t border-[oklch(0.25_0.008_60)] pt-3 mb-3 space-y-2">
              {categories
                .filter((c) => (categoryTotals[c.id] ?? 0) > 0)
                .map((c) => (
                  <div key={c.id} className="flex justify-between items-center">
                    <span className="text-[12px] text-[oklch(0.65_0.006_80)] flex items-center gap-1.5">
                      <span>{c.icon}</span>
                      {c.name}
                    </span>
                    <span className="price-badge text-[12px] text-[oklch(0.82_0.08_75)] font-medium">
                      +{formatPrice(categoryTotals[c.id])}円
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* ── 区切り線 ── */}
          <div className="border-t border-[oklch(0.25_0.008_60)] pt-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[oklch(0.6_0.006_80)]">小計</span>
              <span className="price-badge text-[13px] font-semibold text-[oklch(0.82_0.08_75)]">
                {formatPrice(grandTotal)}円
              </span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[11px] text-[oklch(0.45_0.006_80)]">
                消費税（10%）
              </span>
              <span className="price-badge text-[12px] text-[oklch(0.5_0.006_80)]">
                {formatPrice(Math.round(grandTotal * 0.1))}円
              </span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[12px] font-semibold text-[oklch(0.78_0.006_80)]">
                税込合計
              </span>
              <span className="price-badge text-[14px] font-bold text-[oklch(0.92_0.004_80)]">
                {formatPrice(Math.round(grandTotal * 1.1))}円
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-[12px] text-[oklch(0.45_0.006_80)] mb-4">
          オプションを選択すると合計が表示されます
        </p>
      )}

      {/* ── アクションボタン ── */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onExportPDF}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[oklch(0.72_0.13_75)] text-[oklch(0.12_0.008_60)] text-[13px] font-semibold hover:bg-[oklch(0.78_0.12_75)] active:scale-[0.98] transition-all duration-150"
        >
          <FileText className="w-4 h-4" />
          見積書を出力（PDF）
        </button>
        <button
          type="button"
          onClick={onShareLINE}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[oklch(0.22_0.008_60)] text-[oklch(0.82_0.004_80)] text-[13px] font-medium hover:bg-[oklch(0.28_0.008_60)] active:scale-[0.98] transition-all duration-150 border border-[oklch(0.3_0.008_60)]"
        >
          <Share2 className="w-4 h-4" />
          LINEで共有
        </button>
      </div>
    </div>
  );
}
