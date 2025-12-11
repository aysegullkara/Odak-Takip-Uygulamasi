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
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "4",
  },
};

const screenWidth = Dimensions.get("window").width - 32;

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
        const colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8"];
        return {
          name,
          population: minutes,
          color: colors[index % colors.length],
          legendFontColor: "#333",
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
        <Text style={styles.sessionCategory}>{item.category}</Text>
        <Text style={styles.sessionText}>
          Süre: {minutes} dk | Dikkat dağınıklığı: {item.distractions}
        </Text>
        <Text style={styles.sessionText}>Tarih: {date.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Raporlar</Text>

        {/* Genel İstatistikler */}
        <View style={styles.statsBox}>
          <Text style={styles.statsText}>
            Bugün Toplam Odaklanma Süresi:{" "}
            <Text style={styles.statsStrong}>{todayMinutes} dk</Text>
          </Text>
          <Text style={styles.statsText}>
            Tüm Zamanların Toplam Odaklanma Süresi:{" "}
            <Text style={styles.statsStrong}>{totalMinutes} dk</Text>
          </Text>
          <Text style={styles.statsText}>
            Toplam Dikkat Dağınıklığı Sayısı:{" "}
            <Text style={styles.statsStrong}>{totalDistractions}</Text>
          </Text>
        </View>

        {/* Son 7 gün Bar Chart */}
        <Text style={styles.sectionTitle}>Son 7 Gün Odaklanma Süreleri</Text>
        <BarChart
          data={{
            labels: last7Labels,
            datasets: [{ data: last7Data }],
          }}
          width={screenWidth}
          height={220}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=" dk"
          chartConfig={chartConfig}
          style={styles.chart}
        />

        {/* Kategorilere göre Pasta Grafik */}
        <Text style={styles.sectionTitle}>Kategorilere Göre Dağılım</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth}
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

        {/* Seans listesi */}
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
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  statsBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    marginVertical: 2,
  },
  statsStrong: {
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#777",
    marginBottom: 8,
  },
  sessionCard: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  sessionCategory: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  sessionText: {
    fontSize: 12,
  },
});
