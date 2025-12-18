import React, { useMemo, useRef } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
// ✅ YENİ: Kaydırma hareketi için gerekli import
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { FocusSession } from "../../App";
import { COLORS } from "../theme/colors";
import StatCard from "../components/reports/StatCard";
import SessionCard from "../components/reports/SessionCard";
import PieLegend from "../components/reports/PieLegend";

type ReportsProps = {
  sessions: FocusSession[];
  onDeleteSession: (id: string) => void;
};

const PINK_BORDER = "rgba(236,72,153,0.22)";

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  propsForDots: { r: "4" },
};

const WINDOW_WIDTH = Dimensions.get("window").width;
const chartWidth = WINDOW_WIDTH - 64;

// =====================================================================
// ✅ YENİ BİLEŞEN: Kaydırılabilir Satır (Swipeable Row)
// Bu bileşen, normal kartı sarar ve arkasına sil butonunu gizler.
// =====================================================================
type SwipeableRowProps = {
  item: FocusSession;
  onDelete: (id: string) => void;
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({ item, onDelete }) => {
  const swipeableRef = useRef<Swipeable>(null);

  // Silme onayı
  const confirmDelete = () => {
    // Kaydırmayı kapat (eski haline getir)
    swipeableRef.current?.close();

    Alert.alert(
      "Seansı Sil",
      "Bu kaydı silmek istediğine emin misin? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  // Kart sola kaydırılınca arkada gözükecek kısım (Sağ Aksiyon)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Butonun kayarken hafifçe büyümesi için animasyon (opsiyonel estetik)
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity onPress={confirmDelete} style={styles.swipedDeleteButton}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.swipedDeleteText}>Sil</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    // containerStyle: Kartın etrafındaki gölge/margin bozulmasın diye
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeableContainer}
    >
      <SessionCard item={item} />
    </Swipeable>
  );
};
// =====================================================================

const ReportsScreen: React.FC<ReportsProps> = ({ sessions, onDeleteSession }) => {
  // --- MANTIK KISMI (Hesaplamalar) - AYNEN KORUNDU ---
  const { todayMinutes, totalMinutes, totalDistractions, last7Labels, last7Data, pieData } =
    useMemo(() => {
      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);

      let todaySeconds = 0;
      let totalSeconds = 0;
      let totalDistractionsLocal = 0;

      sessions.forEach((s) => {
        const dateKey = (s.completedAt ?? "").slice(0, 10);
        totalSeconds += s.actualDurationSeconds;
        totalDistractionsLocal += s.distractions;
        if (dateKey === todayKey) todaySeconds += s.actualDurationSeconds;
      });

      const labels: string[] = [];
      const data: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);

        const daySeconds = sessions
          .filter((s) => (s.completedAt ?? "").slice(0, 10) === key)
          .reduce((sum, s) => sum + s.actualDurationSeconds, 0);

        labels.push(`${d.getDate()}.${d.getMonth() + 1}`);
        data.push(Math.round(daySeconds / 60));
      }

      const categoryMap = new Map<string, number>();
      sessions.forEach((s) => {
        const prev = categoryMap.get(s.category) ?? 0;
        categoryMap.set(s.category, prev + s.actualDurationSeconds);
      });

      const totalAll = Array.from(categoryMap.values()).reduce((sum, sec) => sum + sec, 0);

      const colors = [COLORS.PINK, "#fb7185", "#fda4af", "#f472b6", "#db2777"];

      const pie = Array.from(categoryMap.entries())
        .filter(([, sec]) => sec > 0)
        .map(([name, sec], index) => {
          const minutes = Math.round(sec / 60);
          const percent = totalAll > 0 ? Math.round((sec / totalAll) * 100) : 0;

          return {
            name,
            population: minutes,
            percent,
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
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header ve İstatistik Kartları (Aynen Korundu) */}
        <View style={styles.header}>
          <Text style={styles.title}>Raporlar</Text>
          <Text style={styles.subtitle}>Odak süreni ve dikkat dağınıklıklarını buradan takip et.</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Bugün" value={`${todayMinutes} dk`} hint="Toplam odak süresi" />
          <StatCard label="Tüm zamanlar" value={`${totalMinutes} dk`} hint="Toplam odak süresi" />
          <StatCard label="Dikkat" value={totalDistractions} hint="Toplam sayı" />
        </View>

        {/* Grafikler (Aynen Korundu) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Son 7 Gün Odaklanma Süreleri</Text>
          {last7Data.every((v) => v === 0) ? (
            <Text style={styles.emptyText}>Son 7 gün için henüz kayıtlı odaklanma süresi yok.</Text>
          ) : (
            <BarChart
              data={{ labels: last7Labels, datasets: [{ data: last7Data }] }}
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategorilere Göre Dağılım</Text>
          {pieData.length > 0 ? (
            <>
              <View style={styles.pieWrapper}>
                <PieChart
                  data={pieData as any}
                  width={WINDOW_WIDTH - 32}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  hasLegend={false}
                  center={[87, 0]}
                  absolute={false}
                />
              </View>
              <PieLegend items={pieData.map((p) => ({ name: p.name, color: p.color, percent: p.percent }))} />
            </>
          ) : (
            <Text style={styles.emptyText}>Kategorilere dağılım için yeterli veri yok.</Text>
          )}
        </View>

        {/* ✅ GÜNCELLENEN LİSTE KISMI */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Tüm Seanslar</Text>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>Henüz tamamlanan odak seansı yok.</Text>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              // renderItem artık yeni SwipeableRow bileşenini kullanıyor
              renderItem={({ item }) => (
                <SwipeableRow item={item} onDelete={onDeleteSession} />
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  scrollContent: { paddingTop: 28, paddingHorizontal: 16, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.TEXT },
  subtitle: { marginTop: 4, fontSize: 13, color: "#6b7280", textAlign: "center" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },

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
  // Liste bölümü için özel stil (kart gölgesi olmasın diye)
  listSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: COLORS.TEXT, marginBottom: 8 },
  chart: { marginTop: 4, borderRadius: 12 },

  emptyText: { fontStyle: "italic", color: "#6b7280", fontSize: 13, marginTop: 6 },

  pieWrapper: { alignItems: "center", justifyContent: "center" },

  // ✅ YENİ STİLLER (Swipe için)
  swipeableContainer: {
    marginBottom: 10, // Kartlar arası boşluk
    borderRadius: 18,
    overflow: "hidden", // Kaydırınca köşelerden taşmasın
  },
  swipedDeleteButton: {
    backgroundColor: "#ef4444", // Kırmızı arka plan
    justifyContent: "center",
    alignItems: "center",
    width: 90, // Buton genişliği
    height: "100%", // Kartın boyu kadar
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  swipedDeleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4,
  },
});