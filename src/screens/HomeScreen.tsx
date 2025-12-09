import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import useTimer from "../hooks/useTimer";

const POMODORO_SECONDS = 10;
const CATEGORIES = ["Ders", "Proje", "Diğer"];

type HomeScreenProps = {
  onSessionComplete: (category: string) => void;
};

export default function HomeScreen({ onSessionComplete }: HomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Ders");

  const handleComplete = useCallback(() => {
    // süre bittiğinde App'e haber ver
    onSessionComplete(selectedCategory);
  }, [onSessionComplete, selectedCategory]);

  const { secondsLeft, isRunning, start, pause, reset } = useTimer(
    POMODORO_SECONDS,
    handleComplete
  );

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");
    return `${m}:${s}`;
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
              style={[styles.categoryButton, active && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  active && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Zamanlayıcı */}
      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

      {/* Butonlar */}
      <View style={styles.buttonsRow}>
        <Button
          title={isRunning ? "Duraklat" : "Başlat"}
          onPress={isRunning ? pause : start}
        />
        <Button title="Sıfırla" onPress={reset} />
      </View>
    </View>
  );
}

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
    marginBottom: 24,
    gap: 8,
  } as any,
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007bff",
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: "#007bff",
  },
  categoryButtonText: {
    color: "#007bff",
    fontSize: 14,
  },
  categoryButtonTextActive: {
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
