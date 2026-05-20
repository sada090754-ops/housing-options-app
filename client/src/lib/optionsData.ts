// =============================================================================
// 住宅オプション選択アプリ — オプションデータ定義
// Design: Japanese Craft Modernism — Noto Serif JP / Gold accent / Warm white
// =============================================================================

export type UnitType = "fixed" | "per_tsubo" | "per_sqm";

export interface OptionItem {
  id: string;
  name: string;
  price: number;
  unit: UnitType;
  categoryId: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: OptionItem[];
}

export interface SelectedOption {
  itemId: string;
  quantity: number; // 坪数 or ㎡数（固定の場合は1）
}

// ─── カテゴリデータ ──────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: "panasonic",
    name: "Panasonic",
    icon: "⚡",
    items: [
      { id: "pan-001", name: "ほっとくリーンフード", price: 163143, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-002", name: "スゴピカ・フリオカウンター", price: 93143, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-003", name: "フロントオープン食洗 450", price: 255857, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-004", name: "フロントオープン食洗 600", price: 387143, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-005", name: "ワイドコンロ", price: 148286, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-006", name: "対面収納", price: 357429, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-007", name: "対面収納（スリムカウンター）", price: 573571, unit: "fixed", categoryId: "panasonic" },
      { id: "pan-008", name: "トイレ（Panasonic変更）", price: 382714, unit: "fixed", categoryId: "panasonic" },
    ],
  },
  {
    id: "takara-kitchen",
    name: "タカラ キッチン",
    icon: "🍳",
    items: [
      { id: "tak-001", name: "キッチンパネル", price: 85714, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-002", name: "フルフラット対面 奥行105cm", price: 164286, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-003", name: "ダイニング側収納 全収納105cm", price: 128571, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-004", name: "ダイニング側収納 コンロ前収納", price: 50000, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-005", name: "フルフラット対面 奥行90cm", price: 154286, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-006", name: "ダイニング側収納 全収納90cm", price: 128571, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-007", name: "レンジフード SVRA ステンレス", price: 100000, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-008", name: "レンジフード SVRA ブラック", price: 111429, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-009", name: "オイルガード クリア", price: 21429, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-010", name: "オイルガード クリアブラック", price: 28571, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-011", name: "オイルガード ハイタイプ", price: 25714, unit: "fixed", categoryId: "takara-kitchen" },
      { id: "tak-012", name: "オイルガード ハイタイプ ブラック", price: 31429, unit: "fixed", categoryId: "takara-kitchen" },
    ],
  },
  {
    id: "dishwasher",
    name: "食洗機",
    icon: "🫧",
    items: [
      { id: "dis-001", name: "リンナイ フロントオープン シルバー", price: 142857, unit: "fixed", categoryId: "dishwasher" },
      { id: "dis-002", name: "リンナイ フロントオープン ブラック", price: 142857, unit: "fixed", categoryId: "dishwasher" },
      { id: "dis-003", name: "Panasonic フロントオープン 45cm", price: 314286, unit: "fixed", categoryId: "dishwasher" },
      { id: "dis-004", name: "Panasonic フロントオープン 60cm", price: 428571, unit: "fixed", categoryId: "dishwasher" },
      { id: "dis-005", name: "BOSCH 45cm", price: 300000, unit: "fixed", categoryId: "dishwasher" },
      { id: "dis-006", name: "BOSCH 60cm", price: 400000, unit: "fixed", categoryId: "dishwasher" },
    ],
  },
  {
    id: "faucet",
    name: "水栓",
    icon: "🚿",
    items: [
      { id: "fau-001", name: "タッチレス浄水水栓 LC122MC", price: 85714, unit: "fixed", categoryId: "faucet" },
      { id: "fau-002", name: "タッチレス浄水水栓 ブラック", price: 114286, unit: "fixed", categoryId: "faucet" },
      { id: "fau-003", name: "ハンドシャワー水栓 エコ", price: 47143, unit: "fixed", categoryId: "faucet" },
      { id: "fau-004", name: "ハンドシャワー水栓 上位", price: 95714, unit: "fixed", categoryId: "faucet" },
      { id: "fau-005", name: "タッチレスハンドシャワー", price: 78571, unit: "fixed", categoryId: "faucet" },
      { id: "fau-006", name: "タッチレスハンドシャワー 上位", price: 128571, unit: "fixed", categoryId: "faucet" },
    ],
  },
  {
    id: "ih",
    name: "IH",
    icon: "🔥",
    items: [
      { id: "ih-001", name: "Panasonic IH 140,000タイプ", price: 200000, unit: "fixed", categoryId: "ih" },
      { id: "ih-002", name: "Panasonic IH 上位 200,000タイプ", price: 285714, unit: "fixed", categoryId: "ih" },
      { id: "ih-003", name: "日立IH シルバー", price: 207143, unit: "fixed", categoryId: "ih" },
      { id: "ih-004", name: "日立IH ブラック", price: 207143, unit: "fixed", categoryId: "ih" },
    ],
  },
  {
    id: "others",
    name: "その他",
    icon: "🔌",
    items: [
      { id: "oth-001", name: "キッチン側コンセント", price: 35714, unit: "fixed", categoryId: "others" },
      { id: "oth-002", name: "リビング側コンセント", price: 28571, unit: "fixed", categoryId: "others" },
      { id: "oth-003", name: "エンドパネル コンセント開口", price: 14286, unit: "fixed", categoryId: "others" },
    ],
  },
  {
    id: "cupboard",
    name: "カップボード",
    icon: "🗄️",
    items: [
      { id: "cup-001", name: "周辺収納吊戸棚", price: 57143, unit: "fixed", categoryId: "cupboard" },
      { id: "cup-002", name: "カップボードエンドパネル", price: 17143, unit: "fixed", categoryId: "cupboard" },
      { id: "cup-003", name: "メラミンカウンター用エンドパネル", price: 8571, unit: "fixed", categoryId: "cupboard" },
    ],
  },
  {
    id: "bath",
    name: "バス",
    icon: "🛁",
    items: [
      { id: "bat-001", name: "ハンドバー変更", price: 11429, unit: "fixed", categoryId: "bath" },
      { id: "bat-002", name: "マグネットショートミラー", price: 17143, unit: "fixed", categoryId: "bath" },
    ],
  },
  {
    id: "flooring",
    name: "床材",
    icon: "🪵",
    items: [
      { id: "flo-001", name: "ダイケン トリニティ", price: 4285, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-002", name: "ダイケン トリニティグランデ", price: 4285, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-003", name: "リクシル ラフモルタル調", price: 5000, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-004", name: "ラスティック ナラ", price: 17429, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-005", name: "ラスティック ウォールナット", price: 17429, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-006", name: "ラスティック ブラックチェリー", price: 17429, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-007", name: "ラスティック カバ", price: 17429, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-008", name: "ラスティック チーク", price: 22429, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-009", name: "ラスティック メープル", price: 14571, unit: "per_tsubo", categoryId: "flooring" },
      { id: "flo-010", name: "パワフルフロアーREO-ST", price: 286, unit: "per_tsubo", categoryId: "flooring" },
    ],
  },
  {
    id: "construction",
    name: "建築オプション",
    icon: "🏗️",
    items: [
      { id: "con-001", name: "キッチン下がり天井", price: 150000, unit: "fixed", categoryId: "construction" },
      { id: "con-002", name: "ニッチ（1ヵ所）", price: 15000, unit: "fixed", categoryId: "construction" },
      { id: "con-003", name: "室内物干し ホスクリーン", price: 30000, unit: "fixed", categoryId: "construction" },
      { id: "con-004", name: "タオルバー", price: 10000, unit: "fixed", categoryId: "construction" },
      { id: "con-005", name: "可動棚", price: 15000, unit: "fixed", categoryId: "construction" },
      { id: "con-006", name: "TVニッチ", price: 90000, unit: "fixed", categoryId: "construction" },
      { id: "con-007", name: "エコカラット", price: 12000, unit: "per_sqm", categoryId: "construction" },
      { id: "con-008", name: "マグネットボード", price: 20000, unit: "fixed", categoryId: "construction" },
      { id: "con-009", name: "カーテンレール シングル", price: 5000, unit: "fixed", categoryId: "construction" },
      { id: "con-010", name: "カーテンレール ダブル", price: 8000, unit: "fixed", categoryId: "construction" },
      { id: "con-011", name: "アイアン手摺", price: 120000, unit: "fixed", categoryId: "construction" },
      { id: "con-012", name: "造作カウンター", price: 30000, unit: "fixed", categoryId: "construction" },
      { id: "con-013", name: "間接照明", price: 57000, unit: "fixed", categoryId: "construction" },
    ],
  },
  {
    id: "carport",
    name: "カーポート",
    icon: "🚗",
    items: [
      { id: "car-001", name: "リクシル 55×55 二台用 積雪100cm対応", price: 629000, unit: "fixed", categoryId: "carport" },
      { id: "car-002", name: "リクシル 55×55 二台用 積雪150cm対応", price: 843000, unit: "fixed", categoryId: "carport" },
    ],
  },
];

// ─── ユーティリティ関数 ──────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

export function getPriceLabel(item: OptionItem, quantity: number = 1): string {
  const total = item.price * quantity;
  if (item.unit === "per_tsubo") {
    return `+${formatPrice(item.price)}円 / 坪`;
  }
  if (item.unit === "per_sqm") {
    return `+${formatPrice(item.price)}円 / ㎡`;
  }
  return `+${formatPrice(total)}円`;
}

export function calcItemTotal(item: OptionItem, quantity: number): number {
  return item.price * quantity;
}

export function getAllItems(): OptionItem[] {
  return categories.flatMap((c) => c.items);
}

export function getItemById(id: string): OptionItem | undefined {
  return getAllItems().find((i) => i.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
