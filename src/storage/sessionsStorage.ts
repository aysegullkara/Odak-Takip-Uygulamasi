import AsyncStorage from "@react-native-async-storage/async-storage";
import { SESSIONS_KEY } from "../constants/storage";
import type { FocusSession } from "../../App";

export async function loadSessions(): Promise<FocusSession[]> {
  try {
    const json = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!json) return [];
    const parsed: FocusSession[] = JSON.parse(json);

    // Güvenlik: eski kayıtlar completedAt yoksa patlatmasın
    return (parsed ?? []).filter(Boolean).map((s) => ({
      ...s,
      completedAt: (s as any).completedAt ?? new Date().toISOString(),
    }));
  } catch (e) {
    console.warn("Seanslar yüklenirken hata:", e);
    return [];
  }
}

export async function saveSessions(sessions: FocusSession[]) {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("Seanslar kaydedilirken hata:", e);
  }
}
