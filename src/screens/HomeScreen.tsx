// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";

const CATEGORIES = ["Ders", "Proje", "Diğer"];

type HomeScreenProps = {
  pomodoroSeconds: number;
  onSessionComplete: (category: string) => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  pomodoroSeconds,
  onSessionComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Ders");
  const [secondsLeft, setSecondsLeft] = useState<number>(pomodoroSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      console.log("HomeScreen: süre bitti, seans tamamlandı");
      onSessionComplete(selectedCategory);
      setIsRunning(false);
      setSecondsLeft(pomodoroSeconds);
      return;
    }

    const timeoutId = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isRunning, secondsLeft, pomodoroSeconds, selectedCategory, onSessionComplete]);

  const handleStartPause = () => {
    if (!isRunning && secondsLeft <= 0) {
      setSecondsLeft(pomodoroSeconds);
    }
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(pomodoroSeconds);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Rapor hattını test etmek için manuel buton
  const handleTestSession = () => {
    console.log("Manuel test seansı eklendi, kategori:", selectedCategory);
    onSessionComplete(selectedCategory);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa (Zamanlayıcı)</Text>

      <View style={styles.categoryRow}>
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                active && styles.categoryButtonActive,
              ]}
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

      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

      <View style={styles.buttonsRow}>
        <Button
          title={isRunning ? "Duraklat" : "Başlat"}
          onPress={handleStartPause}
        />
        <Button title="Sıfırla" onPress={handleReset} />
      </View>

      {/* Debug + manuel test */}
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Text style={{ color: "#777", marginBottom: 8 }}>
          Debug → running: {String(isRunning)}, secondsLeft: {secondsLeft}
        </Text>
        <Button
          title="Test seans ekle (manuel)"
          onPress={handleTestSession}
          color="#28a745"
        />
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
