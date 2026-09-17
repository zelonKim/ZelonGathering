import { useSignup } from "@/hooks/useSignup";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate: signupMutation, isPending: signupPending } = useSignup();

  const handleSignup = () => {
    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("알림", "올바른 이메일 형식이 아닙니다.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "알림",
        "비밀번호는 영문과 숫자를 포함하여 8자리 이상이어야 합니다.",
      );
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    signupMutation({
      email,
      password,
      passwordConfirm,
    });
  };

/////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            disabled={signupPending}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#292524" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.greetingSection}>
            <Text style={styles.title}>하이루 👋</Text>
            <Text style={styles.subtitle}>
              가입하고, 새로운 사람들과 인사해봐요.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 계정</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@zelon.com"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!signupPending}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="영문, 숫자 포함 8자 이상"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                autoCapitalize="none"
                editable={!signupPending}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호를 한번 더 입력해 주세요"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                autoCapitalize="none"
                editable={!signupPending}
                onSubmitEditing={handleSignup}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={signupPending}
              activeOpacity={0.8}
              style={[
                styles.submitButton,
                signupPending && styles.disabledButton,
              ]}
            >
              {signupPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>가입하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/////////////////////////////////////////////////////////////////////


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBF9",
  },
  header: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  greetingSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#292524",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#78716C",
    marginTop: 8,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78716C",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    fontWeight: "600",
    color: "#292524",
  },
  submitButton: {
    backgroundColor: "#FF7A59",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#FF7A59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
