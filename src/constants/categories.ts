export const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"] as const;
export type Category = (typeof CATEGORIES)[number];
