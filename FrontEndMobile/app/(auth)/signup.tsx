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
      alert(data.message);
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

    // 2. 이메일 형식 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    // 3. 비밀번호 영문+숫자 조합 및 8자리 이상 정규식 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문과 숫자를 포함하여 8자리 이상이어야 합니다.");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 뒤로가기 버튼 헤더 */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            />
          </View>

          {/* 가입 완료 제출 액션 버튼 */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              isPending && { opacity: 0.7 }, // 💡 로딩 중일 때는 버튼을 살짝 투명하게 만들어서 트렌디함 추가
            ]}
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={isPending} // 💡 스피너 돌 때는 터치 안 먹히게 원천 차단!
          >
            {isPending ? (
              // 뱅글뱅글 도는 흰색 스피너 얹기 
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signupButtonText}>가입 완료하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    height: 50,
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 28, paddingTop: 10, paddingBottom: 40 },
  titleSection: { marginBottom: 32 },
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
  formSection: { gap: 18, marginTop: 12 },
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
    backgroundColor: COLORS.primary, // 가입하기는 강렬하고 기분 좋은 코랄 배치!
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
