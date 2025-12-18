import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../theme/colors";

type Props = {
  timeText: string;
};

const { width } = Dimensions.get("window");

export default function TimerCircle({ timeText }: Props) {
  return (
    <View style={styles.timerWrapper}>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText} numberOfLines={1} adjustsFontSizeToFit>
          {timeText}
        </Text>
        <Text style={styles.timerLabel}>Kalan Süre</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerWrapper: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  timerCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: COLORS.BG,
    shadowColor: COLORS.PINK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: COLORS.TEXT,
    textAlign: "center",
    width: "80%",
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.LABEL,
    marginTop: 4,
  },
});
