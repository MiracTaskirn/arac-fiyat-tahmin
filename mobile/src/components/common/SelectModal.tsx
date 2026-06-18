import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAppTheme } from "../../store/theme/ThemeContext";

type SelectModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export default function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
  searchValue,
  onSearchChange,
}: SelectModalProps) {
  const { theme } = useAppTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingTop: 18,
                  paddingHorizontal: 16,
                  paddingBottom: 20,
                  maxHeight: "85%",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 5,
                      borderRadius: 999,
                      backgroundColor: theme.colors.border,
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 20,
                      fontWeight: "800",
                    }}
                  >
                    {title}
                  </Text>

                  <Pressable onPress={onClose}>
                    <Text
                      style={{
                        color: theme.colors.primary,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      Kapat
                    </Text>
                  </Pressable>
                </View>

                <TextInput
                  value={searchValue}
                  onChangeText={onSearchChange}
                  placeholder={`${title} içinde ara...`}
                  placeholderTextColor={theme.colors.muted}
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: theme.colors.backgroundSecondary,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    marginBottom: 14,
                  }}
                />

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                >
                  {options.length === 0 ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.muted,
                          fontSize: 14,
                        }}
                      >
                        Sonuç bulunamadı.
                      </Text>
                    </View>
                  ) : (
                    options.map((item) => {
                      const active = item === selectedValue;

                      return (
                        <Pressable
                          key={item}
                          onPress={() => {
                            onSelect(item);
                            onClose();
                          }}
                          style={{
                            backgroundColor: active
                              ? theme.colors.primarySoft
                              : theme.colors.backgroundSecondary,
                            borderWidth: 1,
                            borderColor: active
                              ? theme.colors.primary
                              : theme.colors.border,
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 14,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? theme.colors.primary : theme.colors.text,
                              fontSize: 15,
                              fontWeight: active ? "700" : "500",
                            }}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}