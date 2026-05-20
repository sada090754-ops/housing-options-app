// =============================================================================
// MobileBottomSheet — スマホ用合計表示ボトムシート
// Design: Japanese Craft Modernism
// =============================================================================

import { useState } from "react";
import { ChevronUp, FileText, Share2, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

interface MobileBottomSheetProps {
  grandTotal: number;
  selectedCount: number;
  onClearAll: () => void;
  onOpenEstimate: () => void;
  onShareLINE: () => void;
}

export default function MobileBottomSheet({
  grandTotal,
  selectedCount,
  onClearAll,
  onOpenEstimate,
  onShareLINE,
}: MobileBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-[oklch(0.12_0.008_60)] text-[oklch(0.92_0.004_80)]",
        "rounded-t-2xl shadow-2xl",
        "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
      )}
    >
      {/* ドラッグハンドル */}
      <div
        className="flex flex-col items-center pt-3 pb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-1 rounded-full bg-[oklch(0.35_0.008_60)] mb-2" />
        <div className="flex items-center justify-between w-full px-5">
          <div>
            <p className="text-[10px] text-[oklch(0.55_0.006_80)] uppercase tracking-widest">
              合計金額（税抜）
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[24px] font-bold price-badge leading-none">
                {formatPrice(grandTotal)}
              </span>
              <span className="text-[12px] text-[oklch(0.6_0.006_80)]">円</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <span className="text-[11px] text-[oklch(0.72_0.13_75)] font-medium">
                {selectedCount}件
              </span>
            )}
            <ChevronUp
              className={cn(
                "w-5 h-5 text-[oklch(0.55_0.006_80)] transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </div>
        </div>
      </div>

      {/* 展開コンテンツ */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          expanded ? "max-h-48" : "max-h-0"
        )}
      >
        <div className="px-5 pb-5 pt-2 space-y-2">
          {/* 税込表示 */}
          <div className="flex justify-between text-[12px] border-t border-[oklch(0.22_0.008_60)] pt-3">
            <span className="text-[oklch(0.55_0.006_80)]">税込合計（10%）</span>
            <span className="price-badge font-semibold text-[oklch(0.82_0.004_80)]">
              {formatPrice(Math.round(grandTotal * 1.1))}円
            </span>
          </div>

          {/* ボタン群 */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenEstimate}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[oklch(0.72_0.13_75)] text-[oklch(0.12_0.008_60)] text-[12px] font-semibold active:scale-[0.98] transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              見積書
            </button>
            <button
              type="button"
              onClick={onShareLINE}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#06C755] text-white text-[12px] font-semibold active:scale-[0.98] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              LINE共有
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-2.5 rounded-xl bg-[oklch(0.22_0.008_60)] text-[oklch(0.6_0.006_80)] text-[12px] active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* セーフエリア */}
      <div className="pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
