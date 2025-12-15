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

// ✅ Pembe palet (HomeScreen ile uyumlu)
const PINK = "#ec4899";
const PINK_SOFT = "rgba(236,72,153,0.12)";
const PINK_BORDER = "rgba(236,72,153,0.22)";
const BG = "#FFF1F6"; // çok açık pembe

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, // ✅ pembe
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  propsForDots: { r: "4" },
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
    const todayKey = now.toISOString().slice(0, 10);

    let todaySeconds = 0;
    let totalSeconds = 0;
    let totalDistractionsLocal = 0;

    // ✅ completedAt güvenli
    sessions.forEach((s) => {
      const dateKey = (s.completedAt ?? "").slice(0, 10);
      totalSeconds += s.actualDurationSeconds;
      totalDistractionsLocal += s.distractions;
      if (dateKey === todayKey) todaySeconds += s.actualDurationSeconds;
    });

    // Son 7 gün bar chart
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      const daySeconds = sessions
        .filter((s) => ((s.completedAt ?? "").slice(0, 10) === key))
        .reduce((sum, s) => sum + s.actualDurationSeconds, 0);

      // Daha kısa etiket: 14/12 yerine 14.12
      labels.push(`${d.getDate()}.${d.getMonth() + 1}`);
      data.push(Math.round(daySeconds / 60));
    }

    // Pie data (dakika bazlı)
    const categoryMap = new Map<string, number>();
    sessions.forEach((s) => {
      const prev = categoryMap.get(s.category) ?? 0;
      categoryMap.set(s.category, prev + s.actualDurationSeconds);
    });

    const colors = [PINK, "#fb7185", "#fda4af", "#f472b6", "#db2777"];

const totalMinutesAll = Array.from(categoryMap.values()).reduce(
  (sum, sec) => sum + sec,
  0
);

const pie = Array.from(categoryMap.entries())
  .filter(([, sec]) => sec > 0)
  .map(([name, sec], index) => {
    const minutes = Math.round(sec / 60);
    const percent =
      totalMinutesAll > 0 ? Math.round((sec / totalMinutesAll) * 100) : 0;

    const colors = [PINK, "#fb7185", "#fda4af", "#f472b6", "#db2777"];

    return {
      name,
      population: minutes, // chart dilimi için
      percent,             // ✅ legend için
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
            Odak süreni ve dikkat dağınıklıklarını buradan takip et.
          </Text>
        </View>

        {/* Özet kartlar */}
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
            <Text style={styles.statsLabel}>Dikkat</Text>
            <Text style={styles.statsValue}>{totalDistractions}</Text>
            <Text style={styles.statsHint}>Toplam sayı</Text>
          </View>
        </View>

        {/* Son 7 gün */}
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

        {/* Pie */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategorilere Göre Dağılım</Text>

          {pieData.length > 0 ? (
            <>
<View style={styles.pieWrapper}>
<View style={styles.pieWrapper}>
  <PieChart
    data={pieData}
    width={WINDOW_WIDTH - 32}
    height={220}
    chartConfig={chartConfig}
    accessor="population"
    backgroundColor="transparent"
    paddingLeft="0"
    hasLegend={false}
    center={[86, 0]}  
    absolute={false}
  />
</View>

</View>
<View style={styles.legendWrap}>
  {pieData.map((p) => (
    <View key={p.name} style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: p.color }]} />
      <Text style={styles.legendText} numberOfLines={2}>
        {p.name}
      </Text>
      <Text style={styles.legendPercent}>{p.percent}%</Text>
    </View>
  ))}
</View>

            </>
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
              scrollEnabled={false}
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
    backgroundColor: BG,
  },
  scrollContent: {
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
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
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6b7280",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },
  statsHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  card: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
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

  // Sessions
  sessionCard: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: "#fff7fb",
    borderWidth: 1,
    borderColor: PINK_BORDER,
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sessionCategory: {
    fontWeight: "900",
    fontSize: 13,
    color: "#111827",
  },
  sessionMinutes: {
    fontWeight: "900",
    fontSize: 13,
    color: PINK,
  },
  sessionText: {
    fontSize: 12,
    color: "#4b5563",
  },
  sessionStrong: {
    fontWeight: "900",
    color: "#111827",
  },
  sessionDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#9ca3af",
  },

  // Legend (wrap’li)
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
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pieWrapper: {
  alignItems: "center",   // 🔥 yatayda tam ortalar
  justifyContent: "center",
},

  legendPercent: {
  marginLeft: "auto",
  fontSize: 12,
  fontWeight: "900",
  color: "#111827",
},

  legendText: {
    fontSize: 12,
    color: "#374151",
    flexShrink: 1,
    fontWeight: "700",
  },
});
