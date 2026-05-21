// =============================================================================
// SidebarNav — 左サイドバーカテゴリナビゲーション
// Design: Japanese Craft Modernism — Deep charcoal / Gold accent
// =============================================================================

import { Heart } from "lucide-react";
import { formatPrice, type Category } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  categories: Category[];
  activeCategory: string | null;
  categoryCounts: Record<string, number>;
  categoryTotals: Record<string, number>;
  grandTotal: number;
  onSelectCategory: (id: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

export default function SidebarNav({
  categories,
  activeCategory,
  categoryCounts,
  categoryTotals,
  grandTotal,
  onSelectCategory,
  showFavorites,
  onToggleFavorites,
  favoritesCount,
}: SidebarNavProps) {
  return (
    <nav className="h-full flex flex-col bg-[oklch(0.12_0.008_60)] text-[oklch(0.92_0.004_80)]">
      {/* ロゴ・タイトル */}
      <div className="px-5 pt-6 pb-5 border-b border-[oklch(0.22_0.008_60)]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[oklch(0.72_0.13_75)] flex items-center justify-center">
            <span className="text-[14px]">🏠</span>
          </div>
          <div>
            <h1 className="text-[13px] font-bold tracking-wide leading-tight">
              オプション選択
            </h1>
            <p className="text-[10px] text-[oklch(0.5_0.006_80)] leading-tight">
              Housing Options
            </p>
          </div>
        </div>
      </div>

      {/* 合計表示 */}
      <div className="px-5 py-4 border-b border-[oklch(0.22_0.008_60)]">
        <p className="text-[10px] text-[oklch(0.5_0.006_80)] uppercase tracking-widest mb-1">
          選択合計（税抜）
        </p>
        <p className="price-badge text-[20px] font-bold text-[oklch(0.92_0.004_80)] leading-none">
          {formatPrice(grandTotal)}
          <span className="text-[12px] font-normal text-[oklch(0.55_0.006_80)] ml-1">円</span>
        </p>
      </div>

      {/* カテゴリリスト */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        {/* お気に入り */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={cn(
            "sidebar-nav-item w-full",
            showFavorites && "active"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 flex-shrink-0",
              showFavorites
                ? "fill-[oklch(0.72_0.13_75)] text-[oklch(0.72_0.13_75)]"
                : "text-[oklch(0.55_0.006_80)]"
            )}
          />
          <span>お気に入り</span>
          {favoritesCount > 0 && (
            <span className="badge">{favoritesCount}</span>
          )}
        </button>

        {/* 区切り */}
        <div className="h-px bg-[oklch(0.22_0.008_60)] my-2 mx-1" />

        {/* カテゴリ一覧 */}
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "sidebar-nav-item w-full",
                activeCategory === cat.id && "active"
              )}
            >
              <span className="text-[14px] flex-shrink-0">{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-[oklch(0.22_0.008_60)]">
        <p className="text-[10px] text-[oklch(0.35_0.006_80)] text-center">
          価格はすべて税抜表示
        </p>
      </div>
    </nav>
  );
}
