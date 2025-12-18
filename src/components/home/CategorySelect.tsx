import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../theme/colors";

type Props = {
  label?: string;
  value: string;
  disabled?: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  options: string[];
  onSelect: (v: string) => void;
};

export default function CategorySelect({
  label = "HEDEFİNİ SEÇ",
  value,
  disabled,
  open,
  onOpen,
  onClose,
  options,
  onSelect,
}: Props) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.dropdown, disabled && { opacity: 0.6 }]}
        activeOpacity={0.85}
        onPress={() => {
          if (disabled) return;
          onOpen();
        }}
      >
        <Text style={styles.dropdownText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>

            {options.map((cat) => {
              const active = value === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    onSelect(cat);
                    onClose();
                  }}
                >
                  <Text style={[styles.modalItemText, active && styles.modalItemTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.PINK_BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownText: {
    color: COLORS.TEXT,
    fontWeight: "800",
  },
  dropdownArrow: {
    color: COLORS.PINK,
    fontWeight: "900",
    fontSize: 16,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  modalTitle: {
    fontWeight: "900",
    color: COLORS.TEXT,
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 10,
  },
  modalItemActive: {
    borderColor: COLORS.PINK_BORDER,
    backgroundColor: COLORS.PINK_SOFT,
  },
  modalItemText: {
    color: COLORS.TEXT,
    fontWeight: "800",
    textAlign: "center",
  },
  modalItemTextActive: {
    color: COLORS.PINK,
    fontWeight: "900",
  },
});
