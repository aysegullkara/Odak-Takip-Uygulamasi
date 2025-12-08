// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import useTimer from "../hooks/useTimer";

const POMODORO_SECONDS = 25 * 60; // 25 dakika

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  return `${m}:${s}`;
}

export default function HomeScreen() {
  const { secondsLeft, isRunning, start, pause, reset } =
    useTimer(POMODORO_SECONDS);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa (Zamanlayıcı)</Text>

      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

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
