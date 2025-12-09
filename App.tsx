import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./src/screens/HomeScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

const Tab = createBottomTabNavigator();

export type FocusSession = {
  id: string;
  category: string;
  durationSeconds: number;
  completedAt: string;
};

const POMODORO_SECONDS = 25 * 60;

export default function App() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  const handleSessionComplete = (category: string) => {
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
              <HomeScreen onSessionComplete={handleSessionComplete} />
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
