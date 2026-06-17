import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, // 💡 로딩 스피너 마입!
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
  primary: "#FF7A59", // 🍑 피치 코랄
  primaryLight: "#FFEBE5",
  background: "#FBFBF9", // 웜 화이트
  surface: "#FFFFFF",
  textMain: "#292524", // 딥 차콜
  textSub: "#78716C",
  border: "#E7E5E4",
  textOpac: "#8d8d8d9b",
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 🚀 1. 백엔드 로그인 API 요청 함수
  const loginUser = async (loginData: any) => {
    const { data } = await client.post("/users/login", loginData);
    return data;
  };

  // 🔄 2. TanStack Query의 useMutation 훅 세팅
  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      alert(
        `${data.user.nickname}님, ZelonGathering에 오신 것을 환영합니다! 🎉`,
      );
      router.replace("/(tabs)"); // 메인 탭 화면으로 강제 리플레이스
    },
    onError: (error: any) => {
      // 백엔드의 UnauthorizedException ('이메일 혹은 비밀번호가 올바르지 않습니다.') 매핑
      const errorMessage =
        error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const handleLogin = () => {
    // 공백 1차 차단
    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    // 이메일 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    loginMutate({
      email,
      password,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 감성 상단 로고 & 타이틀 */}
        <View style={styles.headerSection}>
          <Text style={styles.logoText}>Zelon {"\n"}Gathering</Text>
          <Text style={styles.subtitleText}>
            현생 탈출 완료!{"\n"}지금 내 주변 힙한 소모임 속으로 🚀
          </Text>
        </View>

        {/* 2. 입력 폼 섹션 */}
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

          {/* 💡 로그인 버튼 (로딩 스피너 및 비활성화 가드 적용) */}
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

        {/* 3. 하단 링크 (회원가입 이동) */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerSection: { marginBottom: 40, marginTop: 20 },
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
