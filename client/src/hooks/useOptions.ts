// =============================================================================
// 住宅オプション選択アプリ — 選択状態管理フック
// Design: Japanese Craft Modernism
// =============================================================================

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  categories,
  OptionItem,
  calcItemTotal,
  getItemById,
} from "@/lib/optionsData";

export interface SelectionState {
  [itemId: string]: {
    selected: boolean;
    quantity: number; // 坪数 or ㎡数
  };
}

const STORAGE_KEY = "housing-options-selection";

function loadFromStorage(): SelectionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SelectionState;
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(state: SelectionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useOptions() {
  const [selection, setSelection] = useState<SelectionState>(loadFromStorage);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("housing-options-favorites");
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {}
    return new Set();
  });

  // 永続化
  useEffect(() => {
    saveToStorage(selection);
  }, [selection]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "housing-options-favorites",
        JSON.stringify(Array.from(favorites))
      );
    } catch {}
  }, [favorites]);

  // 選択トグル
  const toggleItem = useCallback((itemId: string) => {
    setSelection((prev) => {
      const current = prev[itemId];
      if (current?.selected) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { selected: true, quantity: 1 },
      };
    });
  }, []);

  // 数量変更（坪数・㎡数）
  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setSelection((prev) => ({
      ...prev,
      [itemId]: { selected: true, quantity: Math.max(0.5, quantity) },
    }));
  }, []);

  // お気に入りトグル
  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // 全クリア
  const clearAll = useCallback(() => {
    setSelection({});
  }, []);

  // 選択済みアイテム一覧
  const selectedItems = useMemo(() => {
    return Object.entries(selection)
      .filter(([, v]) => v.selected)
      .map(([itemId, v]) => {
        const item = getItemById(itemId);
        if (!item) return null;
        return { item, quantity: v.quantity, total: calcItemTotal(item, v.quantity) };
      })
      .filter(Boolean) as { item: OptionItem; quantity: number; total: number }[];
  }, [selection]);

  // カテゴリ別小計
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const { item, total } of selectedItems) {
      map[item.categoryId] = (map[item.categoryId] ?? 0) + total;
    }
    return map;
  }, [selectedItems]);

  // 総合計
  const grandTotal = useMemo(
    () => selectedItems.reduce((sum, { total }) => sum + total, 0),
    [selectedItems]
  );

  // カテゴリ別選択数
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const { item } of selectedItems) {
      map[item.categoryId] = (map[item.categoryId] ?? 0) + 1;
    }
    return map;
  }, [selectedItems]);

  const isSelected = useCallback(
    (itemId: string) => !!selection[itemId]?.selected,
    [selection]
  );

  const getQuantity = useCallback(
    (itemId: string) => selection[itemId]?.quantity ?? 1,
    [selection]
  );

  const isFavorite = useCallback(
    (itemId: string) => favorites.has(itemId),
    [favorites]
  );

  return {
    selection,
    favorites,
    selectedItems,
    categoryTotals,
    grandTotal,
    categoryCounts,
    toggleItem,
    setQuantity,
    toggleFavorite,
    clearAll,
    isSelected,
    getQuantity,
    isFavorite,
  };
}
