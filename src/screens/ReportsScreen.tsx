// src/screens/ReportsScreen.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

type FocusSession = {
  id: string;
  category: string;
  durationSeconds: number;
  completedAt: string;
};

type ReportsProps = {
  sessions: FocusSession[];
};

const ReportsScreen: React.FC<ReportsProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Raporlar</Text>
        <Text style={styles.empty}>
          Henüz tamamlanan odak seansı yok.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <Text style={styles.itemText}>
              Süre: {Math.round(item.durationSeconds / 60)} dk
            </Text>
            <Text style={styles.itemDate}>
              {new Date(item.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffffff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    color: "#555",
  },
  item: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  itemCategory: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemText: {},
  itemDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
