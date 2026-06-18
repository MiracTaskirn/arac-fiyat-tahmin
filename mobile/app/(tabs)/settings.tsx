import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ThemeName } from "../../src/theme/themes";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { useAuth } from "../../src/store/auth/AuthContext";

const themeOptions: ThemeName[] = ["neo", "emerald", "midnight"];

export default function SettingsScreen() {
  const { theme, themeName, setThemeName } = useAppTheme();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 18,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Tema
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 20,
          }}
        >
          {themeOptions.map((item) => {
            const active = item === themeName;

            return (
              <Pressable
                key={item}
                onPress={() => setThemeName(item)}
                style={{
                  flex: 1,
                  backgroundColor: active ? theme.colors.primarySoft : theme.colors.backgroundSecondary,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: active ? theme.colors.primary : theme.colors.text,
                    fontSize: 14,
                    fontWeight: "700",
                    textTransform: "capitalize",
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 18,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "700",
              flex: 1,
            }}
          >
            Hesap Durumu
          </Text>

          <View
            style={{
              backgroundColor: isAuthenticated
                ? theme.colors.primarySoft
                : "rgba(217, 119, 6, 0.12)",
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <Text
              style={{
                color: isAuthenticated ? theme.colors.primary : theme.colors.warning,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {isAuthenticated ? "Kullanıcı Oturumu" : "Misafir Oturumu"}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          Misafir kullanıcılar fiyat tahmini yapabilir. Araç öneri sistemi ve tahmin
          geçmişi gibi kullanıcıya özel alanlar için giriş yapılması gerekir.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 18,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Hesap İşlemleri
        </Text>

        {isAuthenticated ? (
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.danger,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Çıkış Yap
            </Text>
          </Pressable>
        ) : (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => router.push("/(auth)/login" as any)}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Giriş Yap
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/register" as any)}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "700" }}>
                Kayıt Ol
              </Text>
            </Pressable>
          </View>
        )}
      </View>


    </ScrollView>
  );
}