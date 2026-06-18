import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ThemeProvider, useAppTheme } from "../src/store/theme/ThemeContext";
import { AuthProvider } from "../src/store/auth/AuthContext";
import { RecommendationProvider } from "../src/store/recommend/RecommendationContext";

function CustomBackButton({ color }: { color: string }) {
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        paddingVertical: 6,
        paddingRight: 10,
      }}
    >
      <Ionicons name="chevron-back" size={26} color={color} />
    </Pressable>
  );
}

function RootNavigator() {
  const { theme, isReady } = useAppTheme();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="recommend/wizard"
        options={{
          title: "Araç Öneri Asistanı",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton color={theme.colors.text} />,
        }}
      />

      <Stack.Screen
        name="(auth)/login"
        options={{
          title: "Giriş Yap",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton color={theme.colors.text} />,
        }}
      />

      <Stack.Screen
        name="(auth)/register"
        options={{
          title: "Kayıt Ol",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton color={theme.colors.text} />,
        }}
      />
      <Stack.Screen
        name="prediction/[id]"
        options={{
          title: "Tahmin Detayı",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton color={theme.colors.text} />,
        }}
      />
      <Stack.Screen
        name="recommend/results"
        options={{
          title: "Öneri Sonuçları",
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton color={theme.colors.text} />,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RecommendationProvider>
          <RootNavigator />
        </RecommendationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}