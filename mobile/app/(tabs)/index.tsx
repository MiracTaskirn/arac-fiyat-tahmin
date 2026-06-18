import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { useAuth } from "../../src/store/auth/AuthContext";

export default function HomeScreen() {
  const { theme, themeName } = useAppTheme();
  const { isAuthenticated } = useAuth();

  const handleRecommendationPress = () => {
    if (isAuthenticated) {
      router.push("/recommend/wizard" as any);
      return;
    }

    router.push("/(auth)/login" as any);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        gap: 16,
      }}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 20,
          padding: 20,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 25,
            fontWeight: "800",
          }}
        >
          Car-Details System
        </Text>

        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Buradan araç fiyat tahmini yapabilir,
          araç öneri modülüne geçebilir ve geçmiş kayıtlarınızı görüntüleyebilirsiniz.
        </Text>

        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          Aktif tema: {themeName}
        </Text>
      </View>

      <ActionCard
        title="Araç Fiyat Tahmini"
        description="Araç bilgilerini girerek tahmini fiyat hesapla."
        onPress={() => router.push("/predict" as any)}
      />

      <ActionCard
        title="Araç Öneri Sistemi"
        description={
          isAuthenticated
            ? "Bütçe ve tercihlere göre en uygun araçları bul."
            : "Bu modül için önce giriş yapman gerekir."
        }
        onPress={handleRecommendationPress}
        badgeText={isAuthenticated ? "Hazır" : "Giriş gerekli"}
      />

      <ActionCard
        title="Tahmin Geçmişi"
        description="Önceki fiyat tahmin kayıtlarını görüntüle."
        onPress={() => router.push("/history" as any)}
      />
    </ScrollView>
  );
}

function ActionCard({
  title,
  description,
  onPress,
  badgeText,
}: {
  title: string;
  description: string;
  onPress: () => void;
  badgeText?: string;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 20,
        padding: 18,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
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
          {title}
        </Text>

        {badgeText ? (
          <View
            style={{
              backgroundColor: theme.colors.primarySoft,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {description}
      </Text>

      <Text
        style={{
          color: theme.colors.primary,
          fontSize: 14,
          fontWeight: "700",
          marginTop: 4,
        }}
      >
        Aç →
      </Text>
    </Pressable>
  );
}