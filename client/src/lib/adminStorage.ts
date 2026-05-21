import { categories, type Category, type OptionItem } from "@/lib/optionsData";

export const ADMIN_SESSION_KEY = "housing-options-admin-authenticated";
export const ADMIN_PASSCODE_HASH_KEY = "housing-options-admin-passcode-hash";
export const EDITABLE_OPTIONS_STORAGE_KEY = "housing-options-editable-categories";

export interface EditableOptionItem extends OptionItem {
  quantity: number;
  cost: number;
}

export interface EditableCategory extends Omit<Category, "items"> {
  items: EditableOptionItem[];
}

export interface ExportedOptionsData {
  version: 1;
  exportedAt: string;
  categories: EditableCategory[];
}

const encoder = new TextEncoder();

export async function hashPasscode(passcode: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(passcode));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

export function hasAdminPasscode(): boolean {
  try {
    return Boolean(localStorage.getItem(ADMIN_PASSCODE_HASH_KEY));
  } catch {
    return false;
  }
}

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  try {
    const savedHash = localStorage.getItem(ADMIN_PASSCODE_HASH_KEY);
    if (!savedHash) return false;
    return (await hashPasscode(passcode)) === savedHash;
  } catch {
    return false;
  }
}

export async function saveAdminPasscode(passcode: string): Promise<void> {
  const hash = await hashPasscode(passcode);
  localStorage.setItem(ADMIN_PASSCODE_HASH_KEY, hash);
}

export function signOutAdmin(): void {
  setAdminAuthenticated(false);
}

export function createDefaultEditableCategories(): EditableCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      quantity: 1,
      cost: Math.round(item.price * 0.7),
    })),
  }));
}

function isEditableCategoryArray(value: unknown): value is EditableCategory[] {
  if (!Array.isArray(value)) return false;
  return value.every((category) => {
    if (!category || typeof category !== "object") return false;
    const candidate = category as Partial<EditableCategory>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.icon === "string" &&
      Array.isArray(candidate.items) &&
      candidate.items.every((item) => {
        const option = item as Partial<EditableOptionItem>;
        return (
          typeof option.id === "string" &&
          typeof option.name === "string" &&
          typeof option.price === "number" &&
          typeof option.cost === "number" &&
          typeof option.quantity === "number" &&
          (option.unit === "fixed" || option.unit === "per_tsubo" || option.unit === "per_sqm") &&
          typeof option.categoryId === "string"
        );
      })
    );
  });
}

export function loadEditableCategories(): EditableCategory[] {
  try {
    const raw = localStorage.getItem(EDITABLE_OPTIONS_STORAGE_KEY);
    if (!raw) return createDefaultEditableCategories();
    const parsed = JSON.parse(raw) as unknown;
    if (isEditableCategoryArray(parsed)) return parsed;
    if (
      parsed &&
      typeof parsed === "object" &&
      isEditableCategoryArray((parsed as Partial<ExportedOptionsData>).categories)
    ) {
      return (parsed as ExportedOptionsData).categories;
    }
  } catch {
    // ignore invalid data
  }
  return createDefaultEditableCategories();
}

export function saveEditableCategories(nextCategories: EditableCategory[]): void {
  localStorage.setItem(EDITABLE_OPTIONS_STORAGE_KEY, JSON.stringify(nextCategories));
}

export function clearEditableCategories(): void {
  localStorage.removeItem(EDITABLE_OPTIONS_STORAGE_KEY);
}

export function toCustomerCategories(editableCategories: EditableCategory[]): Category[] {
  return editableCategories.map((category) => ({
    ...category,
    items: category.items.map(({ cost: _cost, quantity: _quantity, ...item }) => item),
  }));
}

export function createExportPayload(nextCategories: EditableCategory[]): ExportedOptionsData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: nextCategories,
  };
}
