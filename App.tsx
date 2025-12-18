import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

// Screen importları
import HomeScreen from "./src/screens/HomeScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

// Storage fonksiyonları
import { loadSessions, saveSessions } from "./src/storage/sessionsStorage";

// Tipler
export type FocusSession = {
  id: string;
  category: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  distractions: number;
  completedAt: string;
};

export type SessionSummary = {
  category: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  distractions: number;
};

const DEFAULT_POMODORO_SECONDS = 25 * 60;
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // 1. Uygulama açılınca verileri yükle
  useEffect(() => {
    (async () => {
      const s = await loadSessions();
      setSessions(s);
    })();
  }, []);

  // 2. Sessions değişince (ekleme/silme) otomatik kaydet
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Yeni seans ekleme fonksiyonu
  const handleSessionComplete = (payload: SessionSummary) => {
    const newSession: FocusSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      completedAt: new Date().toISOString(),
      ...payload,
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  // ✅ YENİ EKLENEN: Seans silme fonksiyonu
  const handleDeleteSession = (id: string) => {
    // ID'si eşleşmeyenleri tut, eşleşeni filtrele (listeden at)
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false, // Header'ı kapattım (ekranların kendi header'ı var)
            tabBarShowLabel: true,
            tabBarActiveTintColor: "#ec4899",
            tabBarInactiveTintColor: "#9ca3af",
            tabBarStyle: {
              borderTopWidth: 0,
              elevation: 0,
              backgroundColor: "#fff",
              height: 60,
              paddingBottom: 8,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any = "home-outline";

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Reports") {
                iconName = focused ? "bar-chart" : "bar-chart-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" options={{ title: "Ana Sayfa" }}>
            {() => (
              <HomeScreen
                defaultPomodoroSeconds={DEFAULT_POMODORO_SECONDS}
                onSessionComplete={handleSessionComplete}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Reports" options={{ title: "Raporlar" }}>
            {() => (
              <ReportsScreen 
                sessions={sessions} 
                onDeleteSession={handleDeleteSession} // ✅ Burayı bağladık
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;