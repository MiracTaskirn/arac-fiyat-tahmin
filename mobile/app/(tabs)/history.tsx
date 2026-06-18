import React, { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { useAuth } from "../../src/store/auth/AuthContext";
import { deletePredictionHistoryItem, getPredictionHistory } from "../../src/services/history/historyService";
import { PredictionHistoryItem } from "../../src/types/history";

export default function HistoryScreen() {
  const { theme } = useAppTheme();
  const { isAuthenticated, isReady } = useAuth();

  const [items, setItems] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await getPredictionHistory();
      setItems(data);
    } catch (error: any) {
      console.log("History load error:", error?.response?.data || error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isReady) return;

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      (async () => {
        setLoading(true);
        await loadHistory();
        setLoading(false);
      })();
    }, [isAuthenticated, isReady])
  );

  const handleRefresh = async () => {
    if (!isAuthenticated) return;

    try {
      setRefreshing(true);
      await loadHistory();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (item: PredictionHistoryItem) => {
    Alert.alert(
      "Kaydı sil",
      "Bu tahmin kaydını silmek istediğine emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePredictionHistoryItem(item.id);
              await loadHistory();
            } catch (error: any) {
              console.log("Delete error:", error?.response?.data || error);
              Alert.alert("Hata", "Kayıt silinemedi.");
            }
          },
        },
      ]
    );
  };

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 20 }}
      >
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 20,
            gap: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "800",
            }}
          >
            Tahmin Geçmişi
          </Text>

          <Text
            style={{
              color: theme.colors.muted,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Geçmiş kayıtlarını görmek için önce giriş yapman gerekiyor.
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Giriş Yap
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 20,
          gap: 10,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "800",
          }}
        >
          Tahmin Geçmişi
        </Text>

        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Daha önce yaptığın fiyat tahmin kayıtları burada listelenir.
        </Text>
      </View>

      {loading ? (
        <InfoCard text="Kayıtlar yükleniyor..." />
      ) : items.length === 0 ? (
        <InfoCard text="Henüz kayıtlı bir tahmin bulunmuyor." />
      ) : (
        items.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onPress={() => router.push(`/prediction/${item.id}` as any)}
            onDelete={() => handleDelete(item)}
          />
        ))
      )}
    </ScrollView>
  );
}

function HistoryCard({
  item,
  onPress,
  onDelete,
}: {
  item: PredictionHistoryItem;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { theme } = useAppTheme();
  const input = item.input_json || {};

  const title = [input.Marka, input.Seri, input.Model].filter(Boolean).join(" ") || "Tahmin Kaydı";

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 18,
        gap: 10,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>

      <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: "800" }}>
        {formatPrice(item.predicted_price)}
      </Text>

      <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
        {formatDate(item.created_at)}
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={onPress}
          style={{
            flex: 1,
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Detay</Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={{
            flex: 1,
            backgroundColor: theme.colors.danger,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sil</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function InfoCard({ text }: { text: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 18,
      }}
    >
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return value;
  }
}