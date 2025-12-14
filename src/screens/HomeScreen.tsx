// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Alert,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native";

// Types
import type { SessionSummary } from "../../App";

// Ödevdeki örneklere uygun kategoriler
const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

// Kullanıcıya sunulan süre seçenekleri (dk)
const DURATION_OPTIONS_MIN = [1, 10, 25];

type HomeScreenProps = {
  defaultPomodoroSeconds: number;
  onSessionComplete: (summary: SessionSummary) => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  defaultPomodoroSeconds,
  onSessionComplete,
}) => {

  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    Math.round(defaultPomodoroSeconds / 60)
  );
  const [sessionDuration, setSessionDuration] = useState<number>(
    defaultPomodoroSeconds
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(sessionDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [distractions, setDistractions] = useState<number>(0);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const newDuration = selectedMinutes * 60;
    setSessionDuration(newDuration);
    setSecondsLeft(newDuration);
    setIsRunning(false);
    setDistractions(0);
  }, [selectedMinutes]);

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

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [isRunning]);

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

  // ============================================================
  // --- GÖRÜNÜM KISMI (UI) - YENİ MODERN TASARIM ---
  // ============================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.container}>
        {/* Header - Başlık ve Durum */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Odaklan</Text>
          <View style={[styles.statusBadge, isRunning ? styles.statusActive : styles.statusIdle]}>
            <Text style={styles.statusText}>{isRunning ? "Aktif" : "Beklemede"}</Text>
          </View>
        </View>

        {/* Ana İçerik */}
        <View style={styles.content}>
          
          {/* Kategori ve Süre Seçimi */}
          <View style={styles.selectionContainer}>
            <Text style={styles.label}>HEDEFİNİ SEÇ</Text>
            
            {/* Kategoriler */}
            <View style={styles.chipScroll}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => !isRunning && setSelectedCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Süre Butonları */}
            <View style={styles.durationRow}>
              {DURATION_OPTIONS_MIN.map((min) => {
                const isActive = selectedMinutes === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[styles.durationBtn, isActive && styles.durationBtnActive]}
                    onPress={() => !isRunning && setSelectedMinutes(min)}
                  >
                    <Text style={[styles.durationText, isActive && styles.durationTextActive]}>
                      {min} dk
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {}
          <View style={styles.timerWrapper}>
            <View style={styles.timerCircle}>
              <Text 
                style={styles.timerText} 
                numberOfLines={1} 
                adjustsFontSizeToFit={true} // <-- Bu satır metnin taşmasını engeller
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
              <Text style={styles.statValue}>{Math.round(sessionDuration / 60)} dk</Text>
              <Text style={styles.statLabel}>Hedeflenen</Text>
            </View>
          </View>
        </View>

        {/* Alt Butonlar */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Bitir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isRunning && styles.pauseButton]}
            onPress={handleStartPause}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>
              {isRunning ? "Duraklat" : "Başlat"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ============================================================
// --- STYLES (Styles) ---
// ============================================================
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Slate 50
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B", // Slate 800
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  statusActive: {
    backgroundColor: "#DCFCE7", // Green 100
  },
  statusIdle: {
    backgroundColor: "#F1F5F9", // Slate 100
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  // İçerik Alanı
  content: {
    flex: 1,
  },
  selectionContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8", // Slate 400
    marginBottom: 12,
    letterSpacing: 1,
  },
  
  // Kategori Çipleri
  chipScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: "#4F46E5", // Indigo 600
    borderColor: "#4F46E5",
  },
  chipText: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Süre Butonları Satırı
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 16,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  durationBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  durationText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 14,
  },
  durationTextActive: {
    color: "#1E293B",
  },

  // Sayaç Dairesi
  timerWrapper: {
    flexGrow: 1, // Ekranın ortasındaki boşluğu doldur
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  timerCircle: {
    width: width * 0.65,      // Ekran genişliğinin %65'i kadar
    height: width * 0.65,     // Kare olması için aynı değer
    borderRadius: (width * 0.65) / 2, // Tam daire
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: "#F8FAFC", // Dış halka ile hafif kontrast
    // Derinlik efekti (Gölge)
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    width: "80%", // Metnin sığması için genişlik sınırı
  },
  timerLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },

  // İstatistikler
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
  },
  statLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Alt Butonlar (Footer)
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
    backgroundColor: "#F1F5F9",
  },
  resetButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 16,
  },
  playButton: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: "#4F46E5", // Indigo
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseButton: {
    backgroundColor: "#F59E0B", // Amber
    shadowColor: "#F59E0B",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});