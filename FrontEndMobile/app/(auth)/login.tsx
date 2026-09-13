import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  border: "#E7E5E4",
  textOpac: "#8d8d8d9b",
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginUser = async (loginData: any) => {
    const { data } = await client.post("/users/login", loginData);
    return data;
  };

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("안내", "이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("안내", "올바른 이메일 형식이 아닙니다.");
      return;
    }

    loginMutate({ email, password });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({
          ios: 30,
          android: 32,
        })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Text style={styles.logoText}>Zelon{"\n"}Gathering </Text>
            <Text style={styles.subtitleText}>
              외출 준비 완료! 🍑{"\n"}지금 내 주변 힙한 소모임 속으로
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>이메일 주소</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소를 입력하세요"
                placeholderTextColor={COLORS.textOpac}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={isPending}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor={COLORS.textOpac}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  disabled={isPending}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isPending}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.textSub}
                    style={{ marginRight: 20 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isPending && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>로그인하기</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerText}>아직 계정이 없으신가요?</Text>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              disabled={isPending}
            >
              <Text style={styles.signupLinkText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 0 : 60,
    paddingBottom: 100,
    justifyContent: "center", 
  },
  headerSection: { marginBottom: 24, marginTop: 10 },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -1,
    lineHeight: 42,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 24,
  },
  formSection: { gap: 20, marginTop: 6 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textSub },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: "600",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  loginButton: {
    backgroundColor: COLORS.textMain,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  loginButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "700" },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
  },
  footerText: { fontSize: 14, color: COLORS.textSub, fontWeight: "500" },
  signupLinkText: { fontSize: 14, color: COLORS.primary, fontWeight: "700" },
});
