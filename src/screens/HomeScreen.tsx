import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { SessionSummary } from "../../App";
import { COLORS } from "../theme/colors";
import { CATEGORIES } from "../constants/categories";
import { DEFAULT_MINUTES, MAX_MINUTES, MIN_MINUTES, QUICK_MINUTES } from "../constants/durations";
import { clamp, formatTime } from "../utils/time";
//import { registerForPushNotificationsAsync, sendLocalNotification } from "../utils/notifications";

import CategorySelect from "../components/home/CategorySelect";
import DurationStepper from "../components/home/DurationStepper";
import TimerCircle from "../components/home/TimerCircle";

type HomeScreenProps = {
  defaultPomodoroSeconds: number;
  onSessionComplete: (summary: SessionSummary) => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ defaultPomodoroSeconds, onSessionComplete }) => {
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [selectedMinutes, setSelectedMinutes] = useState<number>(DEFAULT_MINUTES);
  const [sessionDuration, setSessionDuration] = useState<number>(DEFAULT_MINUTES * 60);
  
  // ✅ Seans başladı mı? (Duraklatılsa bile true kalır)
  const [hasStarted, setHasStarted] = useState(false); 
  
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [secondsLeft, setSecondsLeft] = useState<number>(sessionDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [distractions, setDistractions] = useState<number>(0);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  // hold hızlandırma
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

        Alert.alert("Dikkat Dağınıklığı", "Uygulamadan ayrıldığınız için seans duraklatıldı.");
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

  const handleStartPause = () => {
    // eğer seans daha önce hiç başlamadıysa, başlatınca kilitle
    if (!isRunning && !hasStarted) setHasStarted(true);

    if (!isRunning && secondsLeft <= 0) {
      setSecondsLeft(sessionDuration);
      setDistractions(0);
    }
    setIsRunning((prev) => !prev);
  };


  const finalizeSession = (reason: "Süre tamamlandı" | "Kullanıcı durdurdu") => {
    setIsRunning(false); 
    setHasStarted(false); // ✅ Seans bitince kilidi aç

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
      setHasStarted(false); // ✅ manuel reset de kilidi açar
    }
  };


  const changeMinutes = (delta: number) => {
    // ✅ DEĞİŞİKLİK BURADA: Sadece çalışırken değil, seans başlamışsa da engelle
    if (hasStarted) return; 
    setSelectedMinutes((prev) => clamp(prev + delta, MIN_MINUTES, MAX_MINUTES));
  };

  const startHold = (delta: number) => {
    // ✅ DEĞİŞİKLİK BURADA: hasStarted kontrolü
    if (hasStarted) return;

    changeMinutes(delta);

    holdIntervalRef.current = setInterval(() => {
      changeMinutes(delta * 5);
    }, 220);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Odaklan</Text>
            <View style={[styles.statusBadge, isRunning ? styles.statusActive : styles.statusIdle]}>
              <Text style={styles.statusText}>{isRunning ? "Aktif" : "Beklemede"}</Text>
            </View>
          </View>

          {/* Seçimler */}
          <View style={styles.selectionContainer}>
            <CategorySelect
              value={selectedCategory}
              disabled={hasStarted} // ✅ DEĞİŞİKLİK BURADA: hasStarted ise kilitli
              open={categoryOpen}
              onOpen={() => setCategoryOpen(true)}
              onClose={() => setCategoryOpen(false)}
              options={[...CATEGORIES]}
              onSelect={(v) => setSelectedCategory(v)}
            />

            <DurationStepper
              value={selectedMinutes}
              disabled={hasStarted} // ✅ DEĞİŞİKLİK BURADA: hasStarted ise kilitli
              onMinusPress={() => changeMinutes(-1)}
              onMinusHoldStart={() => startHold(-1)}
              onPlusPress={() => changeMinutes(1)}
              onPlusHoldStart={() => startHold(1)}
              onHoldStop={stopHold}
              quickOptions={QUICK_MINUTES}
              onQuickSelect={(m) => setSelectedMinutes(m)}
            />

            {/* ✅ DEĞİŞİKLİK BURADA: Uyarı metni artık duraklatılınca da görünüyor */}
            {hasStarted ? (
              <Text style={styles.miniHint}>Seans sırasında süre/kategori değiştirilemez.</Text>
            ) : null}
          </View>

          {/* Timer */}
          <TimerCircle timeText={formatTime(secondsLeft)} />

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

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Bitir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isRunning && styles.pauseButton]}
              onPress={handleStartPause}
              activeOpacity={0.85}
            >
              <Text style={styles.playButtonText}>{isRunning ? "Duraklat" : "Başlat"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.BG },
  scrollContent: { paddingBottom: 18 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1E293B", letterSpacing: -0.5 },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FCE7F3",
    borderWidth: 1,
    borderColor: COLORS.PINK_BORDER,
  },
  statusActive: { backgroundColor: "rgba(236,72,153,0.14)" },
  statusIdle: { backgroundColor: "#FCE7F3" },
  statusText: { fontSize: 12, fontWeight: "700", color: COLORS.PINK },

  selectionContainer: { marginBottom: 8 },

  miniHint: {
    textAlign: "center",
    color: COLORS.MUTED,
    marginTop: 8,
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: { alignItems: "center", paddingHorizontal: 20 },
  divider: { width: 1, height: 30, backgroundColor: "rgba(0,0,0,0.08)" },
  statValue: { fontSize: 20, fontWeight: "800", color: COLORS.TEXT },
  statLabel: { fontSize: 12, color: COLORS.LABEL, marginTop: 2 },

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
  resetButtonText: { color: COLORS.MUTED, fontWeight: "800", fontSize: 16 },
  playButton: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: COLORS.PINK,
    alignItems: "center",
    shadowColor: COLORS.PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseButton: { backgroundColor: "#F59E0B", shadowColor: "#F59E0B" },
  playButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
});