// =============================================================================
// Home — 住宅オプション選択アプリ メインページ
// Design: Japanese Craft Modernism
// Features: 検索・お気に入り・折りたたみ・合計・PDF・LINE共有・見積書
// =============================================================================

import { useState, useMemo, useCallback } from "react";
import { Menu } from "lucide-react";
import { categories } from "@/lib/optionsData";
import { useOptions } from "@/hooks/useOptions";
import CategoryCard from "@/components/CategoryCard";
import TotalPanel from "@/components/TotalPanel";
import SearchBar from "@/components/SearchBar";
import SidebarNav from "@/components/SidebarNav";
import EstimateModal from "@/components/EstimateModal";
import MobileBottomSheet from "@/components/MobileBottomSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    selectedItems,
    grandTotal,
    categoryTotals,
    categoryCounts,
    isSelected,
    isFavorite,
    getQuantity,
    toggleItem,
    toggleFavorite,
    setQuantity,
    clearAll,
    favorites,
  } = useOptions();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);

  // 検索フィルタリング
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (showFavorites) {
      return categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => favorites.has(item.id)),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    if (!q) return categories;

    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery, showFavorites, favorites]);

  // カテゴリへスクロール
  const handleSelectCategory = useCallback((catId: string) => {
    setActiveCategory(catId);
    setShowFavorites(false);
    setSearchQuery("");
    setSidebarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`cat-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  // LINE共有
  const handleShareLINE = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error("オプションを選択してください");
      return;
    }
    const lines = [
      "【住宅オプション 選択内容】",
      "",
      ...selectedItems.map(
        ({ item, quantity, total }) =>
          `・${item.name}${item.unit !== "fixed" ? ` (${quantity}${item.unit === "per_tsubo" ? "坪" : "㎡"})` : ""}: ${total.toLocaleString("ja-JP")}円`
      ),
      "",
      `合計（税抜）: ${grandTotal.toLocaleString("ja-JP")}円`,
      `合計（税込）: ${Math.round(grandTotal * 1.1).toLocaleString("ja-JP")}円`,
    ].join("\n");

    const encoded = encodeURIComponent(lines);
    window.open(`https://line.me/R/msg/text/?${encoded}`, "_blank");
  }, [selectedItems, grandTotal]);

  // PDF出力（見積書モーダルを開く）
  const handleExportPDF = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error("オプションを選択してください");
      return;
    }
    setEstimateOpen(true);
  }, [selectedItems.length]);

  // クリア確認
  const handleClearAll = useCallback(() => {
    if (selectedItems.length === 0) return;
    if (window.confirm("選択内容をすべてクリアしますか？")) {
      clearAll();
      toast.success("選択内容をクリアしました");
    }
  }, [selectedItems.length, clearAll]);

  const favoritesCount = favorites.size;

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.004_80)] flex">
      {/* ── デスクトップサイドバー ── */}
      <aside className="hidden lg:flex w-[220px] xl:w-[240px] flex-shrink-0 h-screen sticky top-0">
        <div className="w-full overflow-hidden">
          <SidebarNav
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            categoryTotals={categoryTotals}
            grandTotal={grandTotal}
            onSelectCategory={handleSelectCategory}
            showFavorites={showFavorites}
            onToggleFavorites={() => {
              setShowFavorites((v) => !v);
              setSearchQuery("");
            }}
            favoritesCount={favoritesCount}
          />
        </div>
      </aside>

      {/* ── モバイルサイドバーオーバーレイ ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[260px] h-full">
            <SidebarNav
              activeCategory={activeCategory}
              categoryCounts={categoryCounts}
              categoryTotals={categoryTotals}
              grandTotal={grandTotal}
              onSelectCategory={handleSelectCategory}
              showFavorites={showFavorites}
              onToggleFavorites={() => {
                setShowFavorites((v) => !v);
                setSearchQuery("");
                setSidebarOpen(false);
              }}
              favoritesCount={favoritesCount}
            />
          </div>
        </div>
      )}

      {/* ── メインコンテンツ ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── トップバー ── */}
        <header className="sticky top-0 z-30 bg-[oklch(0.985_0.004_80)]/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            {/* モバイルメニューボタン */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* タイトル（モバイル） */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-[14px] font-semibold">オプション選択</span>
            </div>

            {/* 検索バー */}
            <div className="flex-1 max-w-xl">
              <SearchBar
                value={searchQuery}
                onChange={(v) => {
                  setSearchQuery(v);
                  if (v) setShowFavorites(false);
                }}
              />
            </div>

            {/* 選択件数バッジ（デスクトップ） */}
            {selectedItems.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.92_0.06_80)] border border-[oklch(0.85_0.08_75)]">
                <span className="text-[12px] font-semibold text-[oklch(0.45_0.1_70)]">
                  {selectedItems.length}件選択
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ── コンテンツエリア ── */}
        <div className="flex flex-1 min-h-0">
          {/* カテゴリカード一覧 */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-40 lg:pb-8">
            {/* ページタイトル（デスクトップ） */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-[22px] font-bold text-foreground">
                {showFavorites
                  ? "お気に入りオプション"
                  : searchQuery
                  ? `「${searchQuery}」の検索結果`
                  : "オプション一覧"}
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                {showFavorites
                  ? `${filteredCategories.reduce((s, c) => s + c.items.length, 0)}件のお気に入り`
                  : searchQuery
                  ? `${filteredCategories.reduce((s, c) => s + c.items.length, 0)}件ヒット`
                  : `全${categories.reduce((s, c) => s + c.items.length, 0)}件のオプション — 価格はすべて税抜`}
              </p>
            </div>

            {/* カテゴリカード */}
            {filteredCategories.length > 0 ? (
              <div className="space-y-3">
                {filteredCategories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="animate-fade-slide-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <CategoryCard
                      category={cat}
                      isSelected={isSelected}
                      isFavorite={isFavorite}
                      getQuantity={getQuantity}
                      onToggle={toggleItem}
                      onToggleFavorite={toggleFavorite}
                      onSetQuantity={setQuantity}
                      categoryTotal={categoryTotals[cat.id] ?? 0}
                      selectedCount={categoryCounts[cat.id] ?? 0}
                      defaultOpen={
                        searchQuery !== "" ||
                        showFavorites ||
                        idx === 0
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-[15px] font-medium text-foreground/70">
                  {showFavorites
                    ? "お気に入りがまだありません"
                    : "該当するオプションが見つかりません"}
                </p>
                <p className="text-[13px] text-muted-foreground mt-2">
                  {showFavorites
                    ? "ハートアイコンをタップしてお気に入りに追加できます"
                    : "別のキーワードで検索してみてください"}
                </p>
              </div>
            )}
          </div>

          {/* ── デスクトップ右パネル（合計） ── */}
          <aside className="hidden lg:block w-[280px] xl:w-[300px] flex-shrink-0 h-screen sticky top-14 overflow-y-auto">
            <div className="p-4 pt-5">
              <TotalPanel
                selectedItems={selectedItems}
                grandTotal={grandTotal}
                categoryTotals={categoryTotals}
                onClearAll={handleClearAll}
                onExportPDF={handleExportPDF}
                onShareLINE={handleShareLINE}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* ── モバイルボトムシート ── */}
      <MobileBottomSheet
        grandTotal={grandTotal}
        selectedCount={selectedItems.length}
        onClearAll={handleClearAll}
        onOpenEstimate={handleExportPDF}
        onShareLINE={handleShareLINE}
      />

      {/* ── 見積書モーダル ── */}
      <EstimateModal
        open={estimateOpen}
        onClose={() => setEstimateOpen(false)}
        selectedItems={selectedItems}
        grandTotal={grandTotal}
        categoryTotals={categoryTotals}
        onShareLINE={handleShareLINE}
      />
    </div>
  );
}
