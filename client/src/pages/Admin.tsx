import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileUp,
  LogOut,
  RotateCcw,
  Save,
  Search,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  clearEditableCategories,
  createDefaultEditableCategories,
  createExportPayload,
  signOutAdmin,
  type EditableCategory,
  type EditableOptionItem,
} from "@/lib/adminStorage";
import { useEditableCategories } from "@/hooks/useEditableCategories";
import { formatPrice, type UnitType } from "@/lib/optionsData";
import { cn } from "@/lib/utils";

const unitLabels: Record<UnitType, string> = {
  fixed: "一式",
  per_tsubo: "坪",
  per_sqm: "㎡",
};

function parseNumber(value: string): number {
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function flattenCategories(categories: EditableCategory[]) {
  return categories.flatMap((category) =>
    category.items.map((item) => ({
      category,
      item,
      sellingTotal: item.price * item.quantity,
      costTotal: item.cost * item.quantity,
      profitTotal: (item.price - item.cost) * item.quantity,
    }))
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { editableCategories, setEditableCategories } = useEditableCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const rows = useMemo(() => flattenCategories(editableCategories), [editableCategories]);
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter(({ category, item }) => {
      const matchesCategory = selectedCategory === "all" || category.id === selectedCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [rows, searchQuery, selectedCategory]);

  const summary = useMemo(() => {
    const targetRows = filteredRows;
    const sellingTotal = targetRows.reduce((sum, row) => sum + row.sellingTotal, 0);
    const costTotal = targetRows.reduce((sum, row) => sum + row.costTotal, 0);
    const profitTotal = sellingTotal - costTotal;
    const marginRate = sellingTotal > 0 ? profitTotal / sellingTotal : 0;
    return { sellingTotal, costTotal, profitTotal, marginRate };
  }, [filteredRows]);

  const updateItem = (
    categoryId: string,
    itemId: string,
    updater: (item: EditableOptionItem) => EditableOptionItem
  ) => {
    setEditableCategories((previous) =>
      previous.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? updater(item) : item)),
            }
      )
    );
  };

  const handleExportJson = () => {
    const payload = createExportPayload(editableCategories);
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`housing-options-${date}.json`, JSON.stringify(payload, null, 2));
    toast.success("JSONを書き出しました");
  };

  const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { categories?: EditableCategory[] } | EditableCategory[];
      const importedCategories = Array.isArray(parsed) ? parsed : parsed.categories;
      if (!Array.isArray(importedCategories)) {
        throw new Error("categories が見つかりません");
      }
      setEditableCategories(importedCategories);
      toast.success("JSONからデータを読み込みました");
    } catch (error) {
      toast.error(`JSONの読み込みに失敗しました: ${String(error)}`);
    } finally {
      event.target.value = "";
    }
  };

  const handleReset = () => {
    if (!window.confirm("編集済みデータを初期データに戻しますか？このブラウザのlocalStorage保存分が削除されます。")) {
      return;
    }
    clearEditableCategories();
    setEditableCategories(createDefaultEditableCategories());
    toast.success("初期データに戻しました");
  };

  const handleLogout = () => {
    signOutAdmin();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            お客様ページ
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div>
            <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight">オプション管理</h1>
            <p className="hidden sm:block text-[11px] text-gray-500 mt-0.5">
              オプション名・数量・販売価格・原価を編集し、JSONとして保存できます。
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileUp className="w-3.5 h-3.5" />
              JSON読込
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-3 text-[12px] font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              JSON出力
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <SummaryCard label="販売価格合計" value={`${formatPrice(summary.sellingTotal)}円`} tone="blue" />
          <SummaryCard label="原価合計" value={`${formatPrice(summary.costTotal)}円`} tone="orange" />
          <SummaryCard label="利益額合計" value={`${formatPrice(summary.profitTotal)}円`} tone="green" />
          <SummaryCard label="利益率" value={`${(summary.marginRate * 100).toFixed(1)}%`} tone="purple" />
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="オプション名・カテゴリ・IDで検索..."
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-900 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors",
                  selectedCategory === "all" ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                すべて
              </button>
              {editableCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap",
                    selectedCategory === category.id
                      ? "bg-gray-950 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-gray-600">
              編集内容は入力のたびにこのブラウザのlocalStorageへ保存されます。GitHubへ恒久反映する場合は、JSON出力後にデータ更新としてcommit/pushしてください。
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              初期データへ戻す
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold">編集テーブル</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">表示中 {filteredRows.length} 件 / 全 {rows.length} 件</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Save className="w-3 h-3" />
              自動保存
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="text-left px-4 py-3 font-semibold w-44">カテゴリ</th>
                  <th className="text-left px-4 py-3 font-semibold min-w-[300px]">オプション名</th>
                  <th className="text-center px-3 py-3 font-semibold w-24">単位</th>
                  <th className="text-right px-3 py-3 font-semibold w-28">数量</th>
                  <th className="text-right px-3 py-3 font-semibold w-36">販売価格</th>
                  <th className="text-right px-3 py-3 font-semibold w-36">原価</th>
                  <th className="text-right px-4 py-3 font-semibold w-36">利益</th>
                  <th className="text-right px-4 py-3 font-semibold w-28">利益率</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(({ category, item, profitTotal, sellingTotal }, index) => {
                  const margin = sellingTotal > 0 ? profitTotal / sellingTotal : 0;
                  return (
                    <tr key={item.id} className={cn("border-b border-gray-100", index % 2 === 0 ? "bg-white" : "bg-gray-50/40")}>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{category.icon} {category.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) =>
                            updateItem(category.id, item.id, (current) => ({ ...current, name: event.target.value }))
                          }
                          className="w-full h-9 rounded-lg border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                        />
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500">{unitLabels[item.unit]}</td>
                      <td className="px-3 py-3">
                        <NumberInput
                          value={item.quantity}
                          step={item.unit === "fixed" ? 1 : 0.5}
                          onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, quantity: value }))}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <NumberInput
                          value={item.price}
                          onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, price: Math.round(value) }))}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <NumberInput
                          value={item.cost}
                          onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, cost: Math.round(value) }))}
                        />
                      </td>
                      <td className={cn("px-4 py-3 text-right font-bold", profitTotal >= 0 ? "text-green-700" : "text-red-600")}>
                        {formatPrice(profitTotal)}円
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-600">{(margin * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-gray-100">
            {filteredRows.map(({ category, item, sellingTotal, costTotal, profitTotal }) => {
              const margin = sellingTotal > 0 ? profitTotal / sellingTotal : 0;
              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-gray-500">{category.icon} {category.name} / {unitLabels[item.unit]}</p>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) =>
                          updateItem(category.id, item.id, (current) => ({ ...current, name: event.target.value }))
                        }
                        className="mt-2 w-full h-9 rounded-lg border border-gray-200 px-3 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="数量">
                      <NumberInput value={item.quantity} step={item.unit === "fixed" ? 1 : 0.5} onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, quantity: value }))} />
                    </Field>
                    <Field label="販売価格">
                      <NumberInput value={item.price} onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, price: Math.round(value) }))} />
                    </Field>
                    <Field label="原価">
                      <NumberInput value={item.cost} onChange={(value) => updateItem(category.id, item.id, (current) => ({ ...current, cost: Math.round(value) }))} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 px-3 py-2 text-[11px]">
                    <p><span className="block text-gray-400">販売合計</span><b>{formatPrice(sellingTotal)}円</b></p>
                    <p><span className="block text-gray-400">原価合計</span><b>{formatPrice(costTotal)}円</b></p>
                    <p><span className="block text-gray-400">利益率</span><b className={profitTotal >= 0 ? "text-green-700" : "text-red-600"}>{(margin * 100).toFixed(1)}%</b></p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRows.length === 0 && (
            <div className="text-center py-12 text-[13px] text-gray-400">該当するオプションが見つかりません</div>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "blue" | "orange" | "green" | "purple" }) {
  const toneClass = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    green: "bg-green-50 border-green-100 text-green-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <p className="text-[11px] font-semibold opacity-75">{label}</p>
      <p className="mt-1 text-[17px] sm:text-[20px] font-bold tracking-tight price-badge">{value}</p>
    </div>
  );
}

function NumberInput({ value, onChange, step = 1 }: { value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <input
      type="number"
      min={0}
      step={step}
      value={Number.isInteger(value) ? value : value.toString()}
      onChange={(event) => onChange(parseNumber(event.target.value))}
      className="w-full h-9 rounded-lg border border-gray-200 px-2 text-right text-[13px] tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
