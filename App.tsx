// App.tsx

import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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
      if (!json) {
        setSessions([]);
        return;
      }

      const parsed = JSON.parse(json) as any[];

      // ✅ Eski kayıtları düzelt (migration)
      const fixed: FocusSession[] = (Array.isArray(parsed) ? parsed : [])
        .filter(Boolean)
        .map((s) => ({
          id:
            typeof s.id === "string" && s.id.length > 0
              ? s.id
              : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          category: typeof s.category === "string" ? s.category : "Bilinmiyor",
          targetDurationSeconds: Number(s.targetDurationSeconds) || 0,
          actualDurationSeconds: Number(s.actualDurationSeconds) || 0,
          distractions: Number(s.distractions) || 0,

          // 🔥 asıl kritik: completedAt yoksa ekle
          completedAt:
            typeof s.completedAt === "string" && s.completedAt.length > 0
              ? s.completedAt
              : new Date().toISOString(),
        }));

      setSessions(fixed);

      
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(fixed));
    } catch (error) {
      console.warn("Seanslar yüklenirken hata:", error);
      setSessions([]);
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
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#ec4899",   // pembe
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 12,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Home") {
              iconName = focused ? "timer" : "timer-outline";
            } else if (route.name === "Reports") {
              iconName = focused
                ? "bar-chart"
                : "bar-chart-outline";
            } else {
              iconName = "ellipse-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
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
