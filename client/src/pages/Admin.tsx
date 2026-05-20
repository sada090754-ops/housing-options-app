// =============================================================================
// Admin — 原価管理ページ（社内専用）
// URL: /admin
// 機能: 全オプションの原価・利益額・利益率一覧、カテゴリフィルター、検索、合計表示
// 計算: 原価 = 提示価格 × 0.70 / 利益率 = 30%
// =============================================================================

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Lock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Filter,
} from "lucide-react";
import { useLocation } from "wouter";
import { categories, formatPrice } from "@/lib/optionsData";
import { calcCostRow, calcSummary, type CostRow } from "@/lib/costCalc";
import { cn } from "@/lib/utils";

// ─── 数量の初期値（坪・㎡商品のデフォルト） ──────────────────────────────────
const DEFAULT_QUANTITY: Record<string, number> = {};

export default function Admin() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [quantities, setQuantities] = useState<Record<string, number>>(DEFAULT_QUANTITY);
  const [sortKey, setSortKey] = useState<"name" | "selling" | "cost" | "profit" | "margin">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // 数量取得（デフォルト1）
  const getQty = useCallback(
    (itemId: string) => quantities[itemId] ?? 1,
    [quantities]
  );

  const setQty = useCallback((itemId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(0.5, val) }));
  }, []);

  // 全アイテムをCostRow形式に変換
  const allRows = useMemo<CostRow[]>(() => {
    return categories.flatMap((cat) =>
      cat.items.map((item) => {
        const qty = getQty(item.id);
        const { sellingTotal, costTotal, profitTotal, marginRate } = calcCostRow(
          item.price,
          qty
        );
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          itemId: item.id,
          itemName: item.name,
          unit: item.unit,
          unitPrice: item.price,
          quantity: qty,
          sellingTotal,
          costTotal,
          profitTotal,
          marginRate,
        };
      })
    );
  }, [getQty]);

  // フィルタリング
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      const matchCat =
        selectedCategory === "all" || row.categoryId === selectedCategory;
      const matchSearch =
        !q ||
        row.itemName.toLowerCase().includes(q) ||
        row.categoryName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allRows, searchQuery, selectedCategory]);

  // ソート
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case "name":    va = a.itemName;    vb = b.itemName;    break;
        case "selling": va = a.sellingTotal; vb = b.sellingTotal; break;
        case "cost":    va = a.costTotal;   vb = b.costTotal;   break;
        case "profit":  va = a.profitTotal; vb = b.profitTotal; break;
        case "margin":  va = a.marginRate;  vb = b.marginRate;  break;
      }
      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      }
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return sorted;
  }, [filteredRows, sortKey, sortDir]);

  // 合計
  const summary = useMemo(() => calcSummary(filteredRows), [filteredRows]);

  // ソートトグル
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col)
      return <ChevronDown className="w-3 h-3 text-gray-300 inline ml-1" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-500 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-500 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── ヘッダー ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* 戻るリンク */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            お客様ページ
          </button>

          <div className="w-px h-4 bg-gray-200" />

          {/* タイトル */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-red-50 border border-red-200">
              <Lock className="w-3.5 h-3.5 text-red-500" />
            </div>
            <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">
              原価管理
            </h1>
            <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              社内専用
            </span>
          </div>

          {/* 件数 */}
          <span className="ml-auto text-[12px] text-gray-400">
            {sortedRows.length} / {allRows.length} 件
          </span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        {/* ── サマリーカード ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <SummaryCard
            icon={<DollarSign className="w-4 h-4 text-blue-600" />}
            label="提示価格合計"
            value={`${formatPrice(summary.sellingTotal)}円`}
            color="blue"
          />
          <SummaryCard
            icon={<BarChart3 className="w-4 h-4 text-orange-500" />}
            label="原価合計"
            value={`${formatPrice(summary.costTotal)}円`}
            color="orange"
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4 text-green-600" />}
            label="利益額合計"
            value={`${formatPrice(summary.profitTotal)}円`}
            color="green"
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            label="利益率"
            value={`${(summary.marginRate * 100).toFixed(1)}%`}
            color="purple"
          />
        </div>

        {/* ── フィルター・検索バー ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="オプション名・カテゴリで検索..."
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* カテゴリフィルター */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                selectedCategory === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap",
                  selectedCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── テーブル ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* デスクトップテーブル */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28">
                    カテゴリ
                  </th>
                  <th
                    className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => handleSort("name")}
                  >
                    オプション名 <SortIcon col="name" />
                  </th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600 w-28">
                    単位
                  </th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600 w-24">
                    数量
                  </th>
                  <th
                    className="text-right px-4 py-3 font-semibold text-blue-700 cursor-pointer hover:text-blue-900 select-none w-36"
                    onClick={() => handleSort("selling")}
                  >
                    提示価格 <SortIcon col="selling" />
                  </th>
                  <th
                    className="text-right px-4 py-3 font-semibold text-orange-600 cursor-pointer hover:text-orange-800 select-none w-36"
                    onClick={() => handleSort("cost")}
                  >
                    原価 <SortIcon col="cost" />
                  </th>
                  <th
                    className="text-right px-4 py-3 font-semibold text-green-700 cursor-pointer hover:text-green-900 select-none w-36"
                    onClick={() => handleSort("profit")}
                  >
                    利益額 <SortIcon col="profit" />
                  </th>
                  <th
                    className="text-right px-4 py-3 font-semibold text-purple-700 cursor-pointer hover:text-purple-900 select-none w-24"
                    onClick={() => handleSort("margin")}
                  >
                    利益率 <SortIcon col="margin" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => (
                  <DesktopRow
                    key={row.itemId}
                    row={row}
                    idx={idx}
                    quantity={getQty(row.itemId)}
                    onSetQty={setQty}
                  />
                ))}
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-[13px]">
                      該当するオプションが見つかりません
                    </td>
                  </tr>
                )}
              </tbody>
              {/* フッター合計行 */}
              {sortedRows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-900 text-white">
                    <td colSpan={4} className="px-4 py-3 text-[12px] font-semibold">
                      合計（{sortedRows.length}件）
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-blue-300 price-badge">
                      {formatPrice(summary.sellingTotal)}円
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-orange-300 price-badge">
                      {formatPrice(summary.costTotal)}円
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-green-300 price-badge">
                      {formatPrice(summary.profitTotal)}円
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-purple-300 price-badge">
                      {(summary.marginRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* モバイルカードリスト */}
          <div className="md:hidden divide-y divide-gray-100">
            {sortedRows.map((row, idx) => (
              <MobileRow
                key={row.itemId}
                row={row}
                idx={idx}
                quantity={getQty(row.itemId)}
                onSetQty={setQty}
              />
            ))}
            {sortedRows.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-[13px]">
                該当するオプションが見つかりません
              </div>
            )}
            {/* モバイル合計 */}
            {sortedRows.length > 0 && (
              <div className="bg-gray-900 text-white p-4">
                <p className="text-[11px] text-gray-400 mb-2">合計（{sortedRows.length}件）</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-blue-400">提示価格合計</p>
                    <p className="text-[14px] font-bold text-blue-300 price-badge">
                      {formatPrice(summary.sellingTotal)}円
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-orange-400">原価合計</p>
                    <p className="text-[14px] font-bold text-orange-300 price-badge">
                      {formatPrice(summary.costTotal)}円
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-400">利益額合計</p>
                    <p className="text-[14px] font-bold text-green-300 price-badge">
                      {formatPrice(summary.profitTotal)}円
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-purple-400">利益率</p>
                    <p className="text-[14px] font-bold text-purple-300 price-badge">
                      {(summary.marginRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 注意書き */}
        <p className="text-[11px] text-gray-400 mt-4 text-center">
          ※ 原価 = 提示価格 × 70%　|　利益率 = 30%（固定）　|　この画面は社内専用です
        </p>
      </div>
    </div>
  );
}

// ─── サマリーカード ───────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "orange" | "green" | "purple";
}) {
  const bg: Record<string, string> = {
    blue:   "bg-blue-50 border-blue-100",
    orange: "bg-orange-50 border-orange-100",
    green:  "bg-green-50 border-green-100",
    purple: "bg-purple-50 border-purple-100",
  };
  const text: Record<string, string> = {
    blue:   "text-blue-700",
    orange: "text-orange-700",
    green:  "text-green-700",
    purple: "text-purple-700",
  };
  return (
    <div className={cn("rounded-xl border p-4", bg[color])}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[11px] font-medium text-gray-500">{label}</span>
      </div>
      <p className={cn("text-[16px] font-bold price-badge", text[color])}>{value}</p>
    </div>
  );
}

// ─── デスクトップ行 ───────────────────────────────────────────────────────────

function DesktopRow({
  row,
  idx,
  quantity,
  onSetQty,
}: {
  row: CostRow;
  idx: number;
  quantity: number;
  onSetQty: (id: string, val: number) => void;
}) {
  // 数量変更時にリアルタイム再計算
  const { sellingTotal, costTotal, profitTotal, marginRate } = calcCostRow(
    row.unitPrice,
    quantity
  );

  const unitLabel =
    row.unit === "per_tsubo" ? "/坪" : row.unit === "per_sqm" ? "/㎡" : "（1式）";

  return (
    <tr
      className={cn(
        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      )}
    >
      {/* カテゴリ */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
          <span>{row.categoryIcon}</span>
          <span className="truncate max-w-[80px]">{row.categoryName}</span>
        </span>
      </td>

      {/* オプション名 */}
      <td className="px-4 py-3 font-medium text-gray-800">{row.itemName}</td>

      {/* 単位 */}
      <td className="px-3 py-3 text-center text-[12px] text-gray-500">
        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">
          {formatPrice(row.unitPrice)}円{unitLabel}
        </span>
      </td>

      {/* 数量 */}
      <td className="px-3 py-3 text-center">
        {row.unit !== "fixed" ? (
          <div className="flex items-center justify-center gap-1">
            <input
              type="number"
              value={quantity}
              min={0.5}
              step={0.5}
              onChange={(e) => onSetQty(row.itemId, parseFloat(e.target.value) || 1)}
              className="w-16 h-7 border border-gray-200 rounded text-[12px] text-right px-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
            <span className="text-[11px] text-gray-400">
              {row.unit === "per_tsubo" ? "坪" : "㎡"}
            </span>
          </div>
        ) : (
          <span className="text-[12px] text-gray-400">1式</span>
        )}
      </td>

      {/* 提示価格 */}
      <td className="px-4 py-3 text-right">
        <span className="price-badge font-semibold text-blue-700">
          {formatPrice(sellingTotal)}円
        </span>
      </td>

      {/* 原価 */}
      <td className="px-4 py-3 text-right">
        <span className="price-badge text-orange-600">
          {formatPrice(costTotal)}円
        </span>
      </td>

      {/* 利益額 */}
      <td className="px-4 py-3 text-right">
        <span className="price-badge font-semibold text-green-700">
          {formatPrice(profitTotal)}円
        </span>
      </td>

      {/* 利益率 */}
      <td className="px-4 py-3 text-right">
        <MarginBadge rate={marginRate} />
      </td>
    </tr>
  );
}

// ─── モバイル行 ───────────────────────────────────────────────────────────────

function MobileRow({
  row,
  idx,
  quantity,
  onSetQty,
}: {
  row: CostRow;
  idx: number;
  quantity: number;
  onSetQty: (id: string, val: number) => void;
}) {
  const { sellingTotal, costTotal, profitTotal, marginRate } = calcCostRow(
    row.unitPrice,
    quantity
  );

  return (
    <div className={cn("p-4", idx % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
      {/* ヘッダー行 */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px]">{row.categoryIcon}</span>
            <span className="text-[11px] text-gray-400">{row.categoryName}</span>
          </div>
          <p className="text-[13px] font-semibold text-gray-800 leading-snug">
            {row.itemName}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            単価: {formatPrice(row.unitPrice)}円
            {row.unit === "per_tsubo" ? "/坪" : row.unit === "per_sqm" ? "/㎡" : "（1式）"}
          </p>
        </div>
        <MarginBadge rate={marginRate} />
      </div>

      {/* 数量入力（坪・㎡） */}
      {row.unit !== "fixed" && (
        <div className="flex items-center gap-2 mb-3 bg-blue-50 rounded-lg px-3 py-2">
          <span className="text-[12px] text-blue-700 font-medium">数量：</span>
          <input
            type="number"
            value={quantity}
            min={0.5}
            step={0.5}
            onChange={(e) => onSetQty(row.itemId, parseFloat(e.target.value) || 1)}
            className="w-20 h-7 border border-blue-200 rounded text-[12px] text-right px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-[12px] text-blue-600">
            {row.unit === "per_tsubo" ? "坪" : "㎡"}
          </span>
        </div>
      )}

      {/* 金額グリッド */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-blue-500 mb-0.5">提示価格</p>
          <p className="text-[12px] font-bold text-blue-700 price-badge">
            {formatPrice(sellingTotal)}
            <span className="text-[10px] font-normal">円</span>
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-orange-500 mb-0.5">原価</p>
          <p className="text-[12px] font-bold text-orange-600 price-badge">
            {formatPrice(costTotal)}
            <span className="text-[10px] font-normal">円</span>
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-green-600 mb-0.5">利益額</p>
          <p className="text-[12px] font-bold text-green-700 price-badge">
            {formatPrice(profitTotal)}
            <span className="text-[10px] font-normal">円</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 利益率バッジ ─────────────────────────────────────────────────────────────

function MarginBadge({ rate }: { rate: number }) {
  const pct = (rate * 100).toFixed(1);
  // 30%固定なので常に緑
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 price-badge whitespace-nowrap">
      {pct}%
    </span>
  );
}
