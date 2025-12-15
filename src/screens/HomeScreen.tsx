// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Pressable,
  Alert,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";

import type { SessionSummary } from "../../App";

// Kategoriler
const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

// Default 25 dk, +/- ile değişecek
const DEFAULT_MINUTES = 25;

type HomeScreenProps = {
  defaultPomodoroSeconds: number;
  onSessionComplete: (summary: SessionSummary) => void;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const HomeScreen: React.FC<HomeScreenProps> = ({
  defaultPomodoroSeconds,
  onSessionComplete,
}) => {
  // ✅ Dropdown state (MUTLAKA component içinde olmalı)
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Süreyi 25 dk default yapıyoruz (senin istediğin)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    DEFAULT_MINUTES
  );

  const [sessionDuration, setSessionDuration] = useState<number>(
    DEFAULT_MINUTES * 60
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(sessionDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [distractions, setDistractions] = useState<number>(0);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  // ✅ Basılı tutma (hold) ile hızlandırma
const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  return () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  };
}, []);

  // Süre değişince reset
  useEffect(() => {
    const newDuration = selectedMinutes * 60;
    setSessionDuration(newDuration);
    setSecondsLeft(newDuration);
    setIsRunning(false);
    setDistractions(0);
  }, [selectedMinutes]);

  // AppState: arka plana giderse dikkat dağınıklığı
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (appState.current === nextState) return;

      if (isRunning && nextState === "background") {
        setIsRunning(false);
        setDistractions((prev) => prev + 1);

        Alert.alert(
          "Dikkat Dağınıklığı",
          "Uygulamadan ayrıldığınız için seans duraklatıldı."
        );
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning]);

  // Sayaç geri sayım
  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      finalizeSession("Süre tamamlandı");
      return;
    }

    const timeoutId = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isRunning, secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleStartPause = () => {
    if (!isRunning && secondsLeft <= 0) {
      setSecondsLeft(sessionDuration);
      setDistractions(0);
    }
    setIsRunning((prev) => !prev);
  };

  const finalizeSession = (reason: "Süre tamamlandı" | "Kullanıcı durdurdu") => {
    setIsRunning(false);

    const elapsed = sessionDuration - secondsLeft;
    if (elapsed <= 0) {
      setSecondsLeft(sessionDuration);
      setDistractions(0);
      return;
    }

    const summary: SessionSummary = {
      category: selectedCategory,
      targetDurationSeconds: sessionDuration,
      actualDurationSeconds: elapsed,
      distractions,
    };

    onSessionComplete(summary);

    const minutes = (elapsed / 60).toFixed(1);
    Alert.alert(
      "Seans Özeti",
      `Kategori: ${selectedCategory}\n` +
        `Planlanan süre: ${Math.round(sessionDuration / 60)} dk\n` +
        `Gerçek süre: ${minutes} dk\n` +
        `Dikkat dağınıklığı: ${distractions}`
    );

    setSecondsLeft(sessionDuration);
    setDistractions(0);
  };

  const handleReset = () => {
    if (secondsLeft !== sessionDuration) {
      finalizeSession("Kullanıcı durdurdu");
    } else {
      setIsRunning(false);
      setSecondsLeft(sessionDuration);
      setDistractions(0);
    }
  };

  // ✅ +/- ile süre ayarlama
const MIN_MINUTES = 1;
const MAX_MINUTES = 60;

const changeMinutes = (delta: number) => {
  if (isRunning) return;
  setSelectedMinutes((prev) => clamp(prev + delta, MIN_MINUTES, MAX_MINUTES));
};

// ✅ Basılı tutunca hızlandır: örn. 5 dk atla
const startHold = (delta: number) => {
  if (isRunning) return;
  // ilk anında bir kere uygula
  changeMinutes(delta);

  // sonra hızlı tekrar
  holdIntervalRef.current = setInterval(() => {
    changeMinutes(delta * 5); // 🔥 5'er dk hızlandırma (istersen 2 yaparız)
  }, 220);
};

const stopHold = () => {
  if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  holdIntervalRef.current = null;
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF1F6" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Odaklan</Text>
            <View
              style={[
                styles.statusBadge,
                isRunning ? styles.statusActive : styles.statusIdle,
              ]}
            >
              <Text style={styles.statusText}>
                {isRunning ? "Aktif" : "Beklemede"}
              </Text>
            </View>
          </View>

          {/* Seçimler */}
          <View style={styles.selectionContainer}>
            <Text style={styles.label}>HEDEFİNİ SEÇ</Text>

            {/* ✅ Dropdown kategori */}
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.85}
              onPress={() => {
                if (isRunning) return;
                setCategoryOpen(true);
              }}
            >
              <Text style={styles.dropdownText}>{selectedCategory}</Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

           {/* ✅ Süre stepper */}
<Text style={[styles.label, { marginTop: 14 }]}>ODAK SÜRESİ</Text>

<View style={styles.stepper}>
  {/* - */}
  <Pressable
    style={[styles.stepBtn, isRunning && styles.stepBtnDisabled]}
    onPress={() => changeMinutes(-1)}
    onPressIn={() => startHold(-1)}
    onPressOut={stopHold}
    disabled={isRunning}
  >
    <Text style={styles.stepBtnText}>−</Text>
  </Pressable>

  {/* orta değer */}
  <View style={styles.stepCenter}>
    <Text style={styles.stepValue}>{selectedMinutes}</Text>
    <Text style={styles.stepUnit}>dk</Text>
  </View>

  {/* + */}
  <Pressable
    style={[styles.stepBtn, isRunning && styles.stepBtnDisabled]}
    onPress={() => changeMinutes(1)}
    onPressIn={() => startHold(1)}
    onPressOut={stopHold}
    disabled={isRunning}
  >
    <Text style={styles.stepBtnText}>＋</Text>
  </Pressable>
</View>

{/* ✅ Hızlı seçim */}
<View style={styles.quickRow}>
  {[1, 10, 25].map((m) => {
    const active = selectedMinutes === m;
    return (
      <TouchableOpacity
        key={m}
        style={[styles.quickChip, active && styles.quickChipActive]}
        onPress={() => {
          if (isRunning) return;
          setSelectedMinutes(m);
        }}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.quickChipText, active && styles.quickChipTextActive]}
        >
          {m} dk
        </Text>
      </TouchableOpacity>
    );
  })}
</View>

            {isRunning ? (
              <Text style={styles.miniHint}>
                Seans çalışırken süre/kategori değiştirilemez.
              </Text>
            ) : null}
          </View>

          {/* Timer */}
          <View style={styles.timerWrapper}>
            <View style={styles.timerCircle}>
              <Text
                style={styles.timerText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatTime(secondsLeft)}
              </Text>
              <Text style={styles.timerLabel}>Kalan Süre</Text>
            </View>
          </View>

          {/* İstatistikler */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{distractions}</Text>
              <Text style={styles.statLabel}>Dikkat Dağılması</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedMinutes} dk</Text>
              <Text style={styles.statLabel}>Hedeflenen</Text>
            </View>
          </View>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Bitir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isRunning && styles.pauseButton]}
              onPress={handleStartPause}
              activeOpacity={0.85}
            >
              <Text style={styles.playButtonText}>
                {isRunning ? "Duraklat" : "Başlat"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Kategori Modal */}
      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCategoryOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>

            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setCategoryOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      active && styles.modalItemTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const { width } = Dimensions.get("window");

// ✅ pembe palet
const PINK = "#ec4899";
const PINK_SOFT = "rgba(236,72,153,0.12)";
const PINK_BORDER = "rgba(236,72,153,0.25)";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF1F6", // çok açık pembe
  },
  scrollContent: {
    paddingBottom: 18,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FCE7F3",
    borderWidth: 1,
    borderColor: PINK_BORDER,
  },
  statusActive: {
    backgroundColor: "rgba(236,72,153,0.14)",
  },
  statusIdle: {
    backgroundColor: "#FCE7F3",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: PINK,
  },

  selectionContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
    marginBottom: 10,
    letterSpacing: 1,
  },

  // Dropdown
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: PINK_BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownText: {
    color: "#111827",
    fontWeight: "800",
  },
  dropdownArrow: {
    color: PINK,
    fontWeight: "900",
    fontSize: 16,
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PINK_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PINK_SOFT,
    borderWidth: 1,
    borderColor: PINK_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: {
    opacity: 0.5,
  },
  stepBtnText: {
    color: PINK,
    fontSize: 22,
    fontWeight: "900",
  },
  stepCenter: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  } as any,
  stepValue: {
    color: "#111827",
    fontSize: 36,
    fontWeight: "900",
  },
  stepUnit: {
    color: "#6B7280",
    fontWeight: "800",
    marginBottom: 6,
  },
  miniHint: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    fontSize: 12,
  },

  timerWrapper: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  timerCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#FFF1F6",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    width: "80%",
  },
  timerLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  resetButtonText: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 16,
  },
  playButton: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: PINK,
    alignItems: "center",
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseButton: {
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  modalTitle: {
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 10,
  },
  modalItemActive: {
    borderColor: PINK_BORDER,
    backgroundColor: PINK_SOFT,
  },

  quickRow: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 10,
  marginTop: 10,
} as any,
quickChip: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: PINK_BORDER,
},
quickChipActive: {
  backgroundColor: PINK_SOFT,
  borderColor: PINK_BORDER,
},
quickChipText: {
  color: "#6B7280",
  fontWeight: "800",
  fontSize: 13,
},
quickChipTextActive: {
  color: PINK,
  fontWeight: "900",
},

  modalItemText: {
    color: "#111827",
    fontWeight: "800",
    textAlign: "center",
  },
  modalItemTextActive: {
    color: PINK,
    fontWeight: "900",
  },
});
