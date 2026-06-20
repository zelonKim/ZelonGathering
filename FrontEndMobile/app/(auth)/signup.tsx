import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const signupUser = async (signupData: any) => {
    const { data } = await client.post("/users/signup", signupData);
    return data;
  };

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      alert(data.message || "회원가입이 완료되었습니다! 🎉");
      router.replace("/login");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const handleSignup = () => {
    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문 and 숫자를 포함하여 8자리 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다");
      return;
    }

    signupMutate({
      email,
      password,
      passwordConfirm,
    });
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 헤더 */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} disabled={isPending}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        // 🌟 오프셋 값을 조금 더 넉넉히 주어 키보드가 올라올 때 타이틀 섹션까지 확실하게 밀어 올립니다.
        keyboardVerticalOffset={Platform.select({
          ios: 20,
          android: 10,
        })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 🌟 [구조 변경] 타이틀과 폼을 하나의 흐름 컨테이너로 감싸 전체 레이아웃이 동시에 반응하도록 유도 */}
          <View style={styles.innerContainer}>
            {/* 1. 타이틀 레이어 */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>반가워요! 🍑</Text>
              <Text style={styles.subTitle}>
                간단한 정보만 입력하고 바로 시작해요.
              </Text>
            </View>

            {/* 2. 회원가입 폼 */}
            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>이메일 계정</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@zelon.com"
                  placeholderTextColor={COLORS.textOpac}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={isPending}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="영문, 숫자 포함 8자 이상"
                  placeholderTextColor={COLORS.textOpac}
                  secureTextEntry
                  autoCapitalize="none"
                  disabled={isPending}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>비밀번호 확인</Text>
                <TextInput
                  style={styles.textInput}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  placeholder="비밀번호를 한번 더 입력해 주세요"
                  placeholderTextColor={COLORS.textOpac}
                  secureTextEntry
                  autoCapitalize="none"
                  disabled={isPending}
                />
              </View>

              <TouchableOpacity
                style={[styles.signupButton, isPending && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleSignup}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>가입 완료하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 15 : 10,
    height: 50,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 120,
  },
  // 🌟 [추가] 내부 요소를 균형 있게 배치하고 아래에서부터 유연하게 스크롤이 밀리도록 유도하는 코어 컨테이너
  innerContainer: {
    flex: 1,
    justifyContent: "center", // 화면 전체 기준 중앙 정렬 배치 구조
    paddingTop: 20,
  },
  titleSection: { marginBottom: 24 },
  mainTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSub,
    marginTop: 6,
  },
  formSection: { gap: 18 },
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
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  signupButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "700" },
});
