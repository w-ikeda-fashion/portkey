// CSS 変数が使えない描画環境（next/og の OGP 画像など）向けのデザイントークン。
// 値は src/app/globals.css の --pk-* と必ず揃えること。
export const pk = {
  ground: "#EFE9DF",
  surface: "#F8F4ED",
  chip: "#E6DDCF",
  border: "#E0D6C7",
  rule: "#D9CEBE",
  ink: "#221C17",
  ink2: "#5A4F45",
  ink3: "#7A6D60",
  accent: "#B4552E",
  accentDeep: "#6E2C1A",
  g: ["#E3DACB", "#EBCB9C", "#D9964F", "#B4552E", "#6E2C1A"],
} as const;
