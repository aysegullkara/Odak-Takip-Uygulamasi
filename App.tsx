// App.tsx

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
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  distractions: number;
  completedAt: string; // ISO string
};

export type SessionSummary = {
  category: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  distractions: number;
};


const SESSIONS_KEY = "@focus_sessions";

// 1 dk = 60 sn, 10 dk = 600 sn, 25 dk = 1500 sn
export const ONE_MINUTE = 60;
export const TEN_MINUTES = 600;
export const TWENTYFIVE_MINUTES = 1500;

const DEFAULT_POMODORO_SECONDS = TWENTYFIVE_MINUTES;

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // Uygulama açılırken eski seansları yükle
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const json = await AsyncStorage.getItem(SESSIONS_KEY);
        if (json) {
          const parsed: FocusSession[] = JSON.parse(json);
          setSessions(parsed);
        }
      } catch (error) {
        console.warn("Seanslar yüklenirken hata:", error);
      }
    };

    loadSessions();
  }, []);

  // Seanslar değiştikçe AsyncStorage’a kaydet
  useEffect(() => {
    const saveSessions = async () => {
      try {
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.warn("Seanslar kaydedilirken hata:", error);
      }
    };

    saveSessions();
  }, [sessions]);

  // HomeScreen bize bir seans tamamlandığında çağıracak
  type NewSessionPayload = {
    category: string;
    targetDurationSeconds: number;
    actualDurationSeconds: number;
    distractions: number;
  };

  const handleSessionComplete = (payload: NewSessionPayload) => {
    const newSession: FocusSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      completedAt: new Date().toISOString(),
      ...payload,
    };

    // En yeni seans en başta olacak şekilde ekliyoruz
    setSessions((prev) => [newSession, ...prev]);
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
};

export default App;
