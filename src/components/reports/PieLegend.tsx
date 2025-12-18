import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PieItem = { name: string; color: string; percent: number };

export default function PieLegend({ items }: { items: PieItem[] }) {
  return (
    <View style={styles.legendWrap}>
      {items.map((p) => (
        <View key={p.name} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: p.color }]} />
          <Text style={styles.legendText} numberOfLines={2}>
            {p.name}
          </Text>
          <Text style={styles.legendPercent}>{p.percent}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legendWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  } as any,
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "45%",
    gap: 6,
  } as any,
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontSize: 12,
    color: "#374151",
    flexShrink: 1,
    fontWeight: "700",
  },
  legendPercent: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
});
