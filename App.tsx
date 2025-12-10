// App.tsx
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./src/screens/HomeScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

export type FocusSession = {
  id: string;
  category: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  completedAt: string;       // ISO string
  distractions: number;      // dikkat dağınıklığı sayısı
};

// HomeScreen bize bu özeti gönderecek
export type SessionSummary = {
  category: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  distractions: number;
};

const STORAGE_KEY = "@focus_sessions_v1";

const Tab = createBottomTabNavigator();

// Varsayılan süre: 25 dk
const DEFAULT_POMODORO_SECONDS = 25 * 60;

export default function App() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // Uygulama açıldığında kayıtlı seansları yükle
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed: FocusSession[] = JSON.parse(json);
          setSessions(parsed);
        }
      } catch (e) {
        console.warn("Sessions load error", e);
      }
    };
    loadSessions();
  }, []);

  // Seanslar değiştikçe storage’a kaydet
  useEffect(() => {
    const saveSessions = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.warn("Sessions save error", e);
      }
    };

    // boş listeyi sürekli yazmaya gerek yok ama yazsa da sorun olmaz aslında
    saveSessions();
  }, [sessions]);

  const handleSessionComplete = (summary: SessionSummary) => {
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...summary,
        completedAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home">
            {() => (
              <HomeScreen
                defaultPomodoroSeconds={DEFAULT_POMODORO_SECONDS}
                onSessionComplete={handleSessionComplete}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Reports">
            {() => <ReportsScreen sessions={sessions} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
