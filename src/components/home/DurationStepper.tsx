import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../theme/colors";

type Props = {
  label?: string;
  value: number;
  disabled?: boolean;

  onMinusPress: () => void;
  onMinusHoldStart: () => void;
  onHoldStop: () => void;

  onPlusPress: () => void;
  onPlusHoldStart: () => void;

  quickOptions: readonly number[];
  onQuickSelect: (m: number) => void;
};

export default function DurationStepper({
  label = "ODAK SÜRESİ",
  value,
  disabled,
  onMinusPress,
  onMinusHoldStart,
  onHoldStop,
  onPlusPress,
  onPlusHoldStart,
  quickOptions,
  onQuickSelect,
}: Props) {
  return (
    <>
      <Text style={[styles.label, { marginTop: 14 }]}>{label}</Text>

      <View style={styles.stepper}>
        <Pressable
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          onPress={onMinusPress}
          onPressIn={onMinusHoldStart}
          onPressOut={onHoldStop}
          disabled={disabled}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>

        <View style={styles.stepCenter}>
          <Text style={styles.stepValue}>{value}</Text>
          <Text style={styles.stepUnit}>dk</Text>
        </View>

        <Pressable
          style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
          onPress={onPlusPress}
          onPressIn={onPlusHoldStart}
          onPressOut={onHoldStop}
          disabled={disabled}
        >
          <Text style={styles.stepBtnText}>＋</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        {quickOptions.map((m) => {
          const active = value === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.quickChip, active && styles.quickChipActive, disabled && { opacity: 0.6 }]}
              onPress={() => {
                if (disabled) return;
                onQuickSelect(m);
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>
                {m} dk
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.LABEL,
    marginBottom: 10,
    letterSpacing: 1,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.PINK_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.PINK_SOFT,
    borderWidth: 1,
    borderColor: COLORS.PINK_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: {
    opacity: 0.5,
  },
  stepBtnText: {
    color: COLORS.PINK,
    fontSize: 22,
    fontWeight: "900",
  },
  stepCenter: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  } as any,
  stepValue: {
    color: COLORS.TEXT,
    fontSize: 36,
    fontWeight: "900",
  },
  stepUnit: {
    color: COLORS.MUTED,
    fontWeight: "800",
    marginBottom: 6,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  } as any,
  quickChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.PINK_BORDER,
  },
  quickChipActive: {
    backgroundColor: COLORS.PINK_SOFT,
    borderColor: COLORS.PINK_BORDER,
  },
  quickChipText: {
    color: COLORS.MUTED,
    fontWeight: "800",
    fontSize: 13,
  },
  quickChipTextActive: {
    color: COLORS.PINK,
    fontWeight: "900",
  },
});
