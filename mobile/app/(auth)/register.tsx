import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { useAuth } from "../../src/store/auth/AuthContext";

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen tüm alanları doldur.");
      return;
    }

    try {
      setLoading(true);
      await register(email.trim(), password);
      Alert.alert("Başarılı", "Kayıt oluşturuldu. Şimdi giriş yapabilirsin.");
      router.replace("/(auth)/login" as any);
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert("Kayıt başarısız", "Bilgileri kontrol edip tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 20,
          padding: 20,
          gap: 10,
        }}
      >
        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>
          Yeni hesap oluşturarak kişisel tahmin geçmişi ve kullanıcı işlemlerini kullanabilirsin.
        </Text>
      </View>

      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder=""
        theme={theme}
      />

      <InputField
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        placeholder=""
        secureTextEntry
        theme={theme}
      />

      <Pressable
        onPress={handleRegister}
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
          paddingVertical: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/login" as any)}>
        <Text
          style={{
            color: theme.colors.primary,
            textAlign: "center",
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          Zaten hesabın var mı? Giriş yap
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InputField({
  label,
  theme,
  ...props
}: {
  label: string;
  theme: any;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
        {label}
      </Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.muted}
        style={{
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
        }}
      />
    </View>
  );
}