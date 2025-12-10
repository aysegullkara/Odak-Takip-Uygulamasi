// App.tsx
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./src/screens/HomeScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

const Tab = createBottomTabNavigator();

// TEST için 10 saniye
const POMODORO_SECONDS = 10;

export type FocusSession = {
  id: string;
  category: string;
  durationSeconds: number;
  completedAt: string;
};

export default function App() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  const handleSessionComplete = (category: string) => {
    console.log("Seans tamamlandı, kategori:", category);
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        category,
        durationSeconds: POMODORO_SECONDS,
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
                pomodoroSeconds={POMODORO_SECONDS}
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
