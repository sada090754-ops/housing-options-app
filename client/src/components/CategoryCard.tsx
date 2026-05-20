// =============================================================================
// CategoryCard — カテゴリ別オプション選択カード
// Design: Japanese Craft Modernism — Gold accent / Warm white / Deep black
// =============================================================================

import { useState, useCallback } from "react";
import { ChevronDown, Heart } from "lucide-react";
import { Category, OptionItem, formatPrice, getPriceLabel } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  isSelected: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  getQuantity: (id: string) => number;
  onToggle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
  categoryTotal: number;
  selectedCount: number;
  defaultOpen?: boolean;
}

export default function CategoryCard({
  category,
  isSelected,
  isFavorite,
  getQuantity,
  onToggle,
  onToggleFavorite,
  onSetQuantity,
  categoryTotal,
  selectedCount,
  defaultOpen = false,
}: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={`cat-${category.id}`}
      className="category-card"
    >
      {/* ── ヘッダー ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[oklch(0.97_0.004_80)] transition-colors duration-150"
      >
        {/* アイコン */}
        <span className="text-xl leading-none">{category.icon}</span>

        {/* カテゴリ名 */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-foreground tracking-wide">
            {category.name}
          </h2>
          {selectedCount > 0 && (
            <p className="text-[11px] text-[oklch(0.72_0.13_75)] font-medium mt-0.5">
              {selectedCount}件選択中
            </p>
          )}
        </div>

        {/* 小計 */}
        {categoryTotal > 0 && (
          <span className="price-badge text-[13px] font-semibold text-[oklch(0.72_0.13_75)] mr-2 whitespace-nowrap">
            +{formatPrice(categoryTotal)}円
          </span>
        )}

        {/* 展開アイコン */}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* ── アイテムリスト ── */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          open ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 pb-3 border-t border-border">
          {category.items.map((item, idx) => (
            <OptionRow
              key={item.id}
              item={item}
              selected={isSelected(item.id)}
              favorite={isFavorite(item.id)}
              quantity={getQuantity(item.id)}
              onToggle={onToggle}
              onToggleFavorite={onToggleFavorite}
              onSetQuantity={onSetQuantity}
              animDelay={idx * 30}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── オプション行コンポーネント ───────────────────────────────────────────────

interface OptionRowProps {
  item: OptionItem;
  selected: boolean;
  favorite: boolean;
  quantity: number;
  onToggle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
  animDelay: number;
}

function OptionRow({
  item,
  selected,
  favorite,
  quantity,
  onToggle,
  onToggleFavorite,
  onSetQuantity,
  animDelay,
}: OptionRowProps) {
  const handleToggle = useCallback(() => onToggle(item.id), [item.id, onToggle]);
  const handleFav = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite(item.id);
    },
    [item.id, onToggleFavorite]
  );

  const needsQuantity = item.unit !== "fixed";
  const unitLabel = item.unit === "per_tsubo" ? "坪" : "㎡";

  return (
    <div
      className={cn("option-row mt-1", selected && "selected")}
      onClick={handleToggle}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* チェックボックス */}
      <div className={cn("option-checkbox", selected && "checked animate-check-pop")} />

      {/* 名前 */}
      <span
        className={cn(
          "flex-1 text-[13.5px] leading-snug",
          selected ? "font-medium text-foreground" : "text-foreground/80"
        )}
      >
        {item.name}
      </span>

      {/* 数量入力（坪・㎡の場合） */}
      {needsQuantity && selected && (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            className="quantity-input"
            value={quantity}
            min={0.5}
            step={0.5}
            onChange={(e) => onSetQuantity(item.id, parseFloat(e.target.value) || 1)}
          />
          <span className="text-[11px] text-muted-foreground">{unitLabel}</span>
        </div>
      )}

      {/* 価格 */}
      <span
        className={cn(
          "price-badge text-[12px] whitespace-nowrap ml-auto pl-2",
          selected
            ? "text-[oklch(0.72_0.13_75)] font-semibold"
            : "text-muted-foreground"
        )}
      >
        {getPriceLabel(item, selected ? quantity : 1)}
      </span>

      {/* お気に入りボタン */}
      <button
        type="button"
        onClick={handleFav}
        className="ml-1 p-1 rounded-full hover:bg-[oklch(0.92_0.06_80)] transition-colors duration-150"
        aria-label="お気に入り"
      >
        <Heart
          className={cn(
            "w-3.5 h-3.5 transition-all duration-150",
            favorite
              ? "fill-[oklch(0.72_0.13_75)] text-[oklch(0.72_0.13_75)]"
              : "text-muted-foreground/50"
          )}
        />
      </button>
    </div>
  );
}
