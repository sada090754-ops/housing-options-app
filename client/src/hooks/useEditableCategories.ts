import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EDITABLE_OPTIONS_STORAGE_KEY,
  loadEditableCategories,
  saveEditableCategories,
  toCustomerCategories,
  type EditableCategory,
} from "@/lib/adminStorage";
import type { Category } from "@/lib/optionsData";

export function useEditableCategories() {
  const [editableCategories, setEditableCategoriesState] = useState<EditableCategory[]>(() =>
    loadEditableCategories()
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === EDITABLE_OPTIONS_STORAGE_KEY) {
        setEditableCategoriesState(loadEditableCategories());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setEditableCategories = useCallback(
    (updater: EditableCategory[] | ((previous: EditableCategory[]) => EditableCategory[])) => {
      setEditableCategoriesState((previous) => {
        const next = typeof updater === "function" ? updater(previous) : updater;
        saveEditableCategories(next);
        return next;
      });
    },
    []
  );

  const customerCategories = useMemo<Category[]>(
    () => toCustomerCategories(editableCategories),
    [editableCategories]
  );

  return {
    editableCategories,
    customerCategories,
    setEditableCategories,
  };
}
