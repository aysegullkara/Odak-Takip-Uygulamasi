// src/screens/ReportsScreen.tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import type { FocusSession } from "../../App";

type ReportsProps = {
  sessions: FocusSession[];
};

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // mavi
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  propsForDots: {
    r: "4",
  },
};

const WINDOW_WIDTH = Dimensions.get("window").width;
const chartWidth = WINDOW_WIDTH - 64;

const ReportsScreen: React.FC<ReportsProps> = ({ sessions }) => {
  const {
    todayMinutes,
    totalMinutes,
    totalDistractions,
    last7Labels,
    last7Data,
    pieData,
  } = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

    let todaySeconds = 0;
    let totalSeconds = 0;
    let totalDistractionsLocal = 0;

    sessions.forEach((s) => {
      const dateKey = s.completedAt.slice(0, 10);
      totalSeconds += s.actualDurationSeconds;
      totalDistractionsLocal += s.distractions;
      if (dateKey === todayKey) {
        todaySeconds += s.actualDurationSeconds;
      }
    });

    // Son 7 gün bar chart verisi
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      const daySeconds = sessions
        .filter((s) => s.completedAt.slice(0, 10) === key)
        .reduce((sum, s) => sum + s.actualDurationSeconds, 0);

      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      data.push(Math.round(daySeconds / 60)); // dakika
    }

    // Kategori bazlı pasta grafik
    const categoryMap = new Map<string, number>();
    sessions.forEach((s) => {
      const prev = categoryMap.get(s.category) ?? 0;
      categoryMap.set(s.category, prev + s.actualDurationSeconds);
    });

    const pie = Array.from(categoryMap.entries())
      .filter(([, sec]) => sec > 0)
      .map(([name, sec], index) => {
        const minutes = Math.round(sec / 60);
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];
        return {
          name,
          population: minutes,
          color: colors[index % colors.length],
          legendFontColor: "#374151",
          legendFontSize: 12,
        };
      });

    return {
      todayMinutes: Math.round(todaySeconds / 60),
      totalMinutes: Math.round(totalSeconds / 60),
      totalDistractions: totalDistractionsLocal,
      last7Labels: labels,
      last7Data: data,
      pieData: pie,
    };
  }, [sessions]);

  const renderSessionItem = ({ item }: { item: FocusSession }) => {
    const date = new Date(item.completedAt);
    const minutes = (item.actualDurationSeconds / 60).toFixed(1);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeaderRow}>
          <Text style={styles.sessionCategory}>{item.category}</Text>
          <Text style={styles.sessionMinutes}>{minutes} dk</Text>
        </View>
        <Text style={styles.sessionText}>
          Dikkat dağınıklığı:{" "}
          <Text style={styles.sessionStrong}>{item.distractions}</Text>
        </Text>
        <Text style={styles.sessionDate}>{date.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Raporlar</Text>
          <Text style={styles.subtitle}>
            Günlük odak süreni ve dikkat dağınıklıklarını buradan takip et.
          </Text>
        </View>

        {/* Özet istatistik kartları */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Bugün</Text>
            <Text style={styles.statsValue}>{todayMinutes} dk</Text>
            <Text style={styles.statsHint}>Toplam odak süresi</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Tüm zamanlar</Text>
            <Text style={styles.statsValue}>{totalMinutes} dk</Text>
            <Text style={styles.statsHint}>Toplam odak süresi</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Dikkat dağınıklığı</Text>
            <Text style={styles.statsValue}>{totalDistractions}</Text>
            <Text style={styles.statsHint}>Toplam sayı</Text>
          </View>
        </View>

        {/* Son 7 Gün Bar Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Son 7 Gün Odaklanma Süreleri</Text>
          {last7Data.every((v) => v === 0) ? (
            <Text style={styles.emptyText}>
              Son 7 gün için henüz kayıtlı odaklanma süresi yok.
            </Text>
          ) : (
            <BarChart
  data={{
    labels: last7Labels,
    datasets: [{ data: last7Data }],
  }}
  width={chartWidth}
  height={220}
  fromZero
  showValuesOnTopOfBars
  yAxisLabel=""
  yAxisSuffix=" dk"
  chartConfig={chartConfig}
  style={styles.chart}
/>

          )}
        </View>

        {/* Kategorilere göre Pasta Grafik */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategorilere Göre Dağılım</Text>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={WINDOW_WIDTH}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          ) : (
            <Text style={styles.emptyText}>
              Kategorilere dağılım için yeterli veri yok.
            </Text>
          )}
        </View>

        {/* Seans listesi */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tüm Seanslar</Text>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>
              Henüz tamamlanan odak seansı yok.
            </Text>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              renderItem={renderSessionItem}
              scrollEnabled={false} // ScrollView içinde kendi scroll’unu kapattık
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  statsHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  chart: {
    marginTop: 4,
    borderRadius: 12,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#6b7280",
    fontSize: 13,
    marginTop: 6,
  },
  sessionCard: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sessionCategory: {
    fontWeight: "600",
    fontSize: 13,
    color: "#111827",
  },
  sessionMinutes: {
    fontWeight: "600",
    fontSize: 13,
    color: "#3b82f6",
  },
  sessionText: {
    fontSize: 12,
    color: "#4b5563",
  },
  sessionStrong: {
    fontWeight: "600",
  },
  sessionDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#9ca3af",
  },
});
