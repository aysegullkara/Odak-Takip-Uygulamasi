import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../theme/colors";
import type { FocusSession } from "../../../App";

export default function SessionCard({ item }: { item: FocusSession }) {
  const date = new Date(item.completedAt);
  const minutes = (item.actualDurationSeconds / 60).toFixed(1);

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionCategory}>{item.category}</Text>
        <Text style={styles.sessionMinutes}>{minutes} dk</Text>
      </View>

      <Text style={styles.sessionText}>
        Dikkat dağınıklığı: <Text style={styles.sessionStrong}>{item.distractions}</Text>
      </Text>

      <Text style={styles.sessionDate}>{date.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: "#fff7fb",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.22)",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sessionCategory: { fontWeight: "900", fontSize: 13, color: "#111827" },
  sessionMinutes: { fontWeight: "900", fontSize: 13, color: COLORS.PINK },
  sessionText: { fontSize: 12, color: "#4b5563" },
  sessionStrong: { fontWeight: "900", color: "#111827" },
  sessionDate: { marginTop: 2, fontSize: 11, color: "#9ca3af" },
});
