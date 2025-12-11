// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Alert,
} from "react-native";

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
  // Dakika cinsinden süre seçimi
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

  // Süre seçimi değişince geri sayımı resetle
  useEffect(() => {
    const newDuration = selectedMinutes * 60;
    setSessionDuration(newDuration);
    setSecondsLeft(newDuration);
    setIsRunning(false);
    setDistractions(0);
  }, [selectedMinutes]);

  // AppState (arka plan / geri dönüş) takibi
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (appState.current === nextState) return;

      // Sayaç çalışırken arka plana giderse -> dikkat dağınıklığı
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

  // Sayaç geri sayımı
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
      // Bitmiş seansı yeniden başlatmak isterse süreyi resetleyelim
      setSecondsLeft(sessionDuration);
      setDistractions(0);
    }
    setIsRunning((prev) => !prev);
  };

  // Seansı sonlandırıp özet üretme
  const finalizeSession = (reason: "Süre tamamlandı" | "Kullanıcı durdurdu") => {
    setIsRunning(false);

    const elapsed = sessionDuration - secondsLeft;
    if (elapsed <= 0) {
      // Hiç zaman geçmeden sıfırlarsa kayıt alma
      setSecondsLeft(sessionDuration);
      setDistractions(0);
      return;
    }

    const summary: SessionSummary = {
      category: selectedCategory,
      plannedDurationSeconds: sessionDuration,
      actualDurationSeconds: elapsed,
      distractions,
    };

    // Raporlara kaydetmesi için App'e gönder
    onSessionComplete(summary);

    // Kullanıcıya kısa özet
    const minutes = (elapsed / 60).toFixed(1);
    Alert.alert(
      "Seans Özeti",
      `Kategori: ${selectedCategory}\n` +
        `Planlanan süre: ${Math.round(sessionDuration / 60)} dk\n` +
        `Gerçek süre: ${minutes} dk\n` +
        `Dikkat dağınıklığı: ${distractions}`
    );

    // Sonrasında ekranı yeni seans için hazırla
    setSecondsLeft(sessionDuration);
    setDistractions(0);
  };

  const handleReset = () => {
    // Kullanıcı seans esnasında SIFIRLA'ya basarsa seansı bitmiş say
    if (secondsLeft !== sessionDuration) {
      finalizeSession("Kullanıcı durdurdu");
    } else {
      // Zaten başlatılmamışsa sadece state'leri sıfırla
      setIsRunning(false);
      setSecondsLeft(sessionDuration);
      setDistractions(0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa (Zamanlayıcı)</Text>

      {/* Kategori seçimi */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Süre seçimi */}
      <View style={styles.durationRow}>
        {DURATION_OPTIONS_MIN.map((min) => {
          const active = selectedMinutes === min;
          return (
            <TouchableOpacity
              key={min}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
              onPress={() => setSelectedMinutes(min)}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
                ]}
              >
                {min} dk
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sayaç */}
      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

      {/* Butonlar */}
      <View style={styles.buttonsRow}>
        <Button
          title={isRunning ? "Duraklat" : "Başlat"}
          onPress={handleStartPause}
        />
        <Button title="Sıfırla" onPress={handleReset} />
      </View>

      {/* Debug / bilgi alanı (raporda screenshot için de güzel olur) */}
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Text style={{ color: "#777" }}>
          Kategori: {selectedCategory} | Süre: {selectedMinutes} dk
        </Text>
        <Text style={{ color: "#777" }}>
          Çalışıyor mu?: {String(isRunning)} | Kalan: {secondsLeft} sn | Dikkat dağınıklığı: {distractions}
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  } as any,
  durationRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  } as any,
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007bff",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  chipActive: {
    backgroundColor: "#007bff",
  },
  chipText: {
    color: "#007bff",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
});
