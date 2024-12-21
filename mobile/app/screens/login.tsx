import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "expo-router";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isVerificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const navigation = useRouter();

  const handleAuth = async (event:any) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || (isSignUp && !confirmPassword)) {
      setLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationEmail(email);
      setVerificationModalVisible(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      } catch (error) {
      const errorMessages = {
        "auth/email-already-in-use": "Email is already in use",
        "auth/weak-password": "Password is too weak",
        "auth/invalid-email": "Email is invalid",
      };
      const errorCode = (error as { code: keyof typeof errorMessages }).code;
      setError(errorMessages[errorCode] || (error as Error).message);
      setLoading(false);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user.emailVerified) {
          setLoading(false);
          navigation.push("/home");
        } else {
          setError("Please verify your email before logging in.");
          setLoading(false);
          await auth.signOut();
          navigation.push("/login"); 
        }
      } catch (error) {
        const errorMessages = {
          "auth/wrong-password": "Email or password is incorrect",
          "auth/user-not-found": "Email or password is incorrect",
          "auth/invalid-credential": "Email or password is incorrect",
          "auth/invalid-email": "Email or password is wrong",
          "auth/user-disabled": "User is disabled",
          "auth/weak-password": "Password is too weak",
        };
        const errorCode = (error as { code: keyof typeof errorMessages }).code;
        setError(errorMessages[errorCode] || (error as Error).message);
        setLoading(false);
      }
    }
  };

  const handlePasswordReset = () => {
    setLoading(true);

    if (!resetEmail) {
      setLoading(false);
      return;
    }

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setModalVisible(false);
        setResetEmail("");
        alert("Password reset email sent successfully!");
        setLoading(false);
      })
      .catch((error) => {
        const errorMessages = {
          "auth/user-not-found": "User not found",
          "auth/invalid-email": "Email is invalid",
        };
        const errorCode = (error as { code: keyof typeof errorMessages }).code;
        setError(errorMessages[errorCode] || (error as Error).message);
        setLoading(false);
      });
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView
          style={{ marginTop: Platform.OS == "android" ? 30 : 0 }}
        />
        <View style={styles.appNameContainer}>
          <View style={styles.line} />
          <Text style={styles.appName}>Ebookd</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            onPress={toggleSignUp}
            style={[
              styles.radioButton,
              !isSignUp && styles.radioButtonSelected,
            ]}
          >
            <View style={styles.radioCircle}>
              {!isSignUp && <View style={styles.selectedRb} />}
            </View>
            <Text
              style={isSignUp ? styles.radioText : styles.radioTextSelected}
            >
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleSignUp}
            style={[styles.radioButton, isSignUp && styles.radioButtonSelected]}
          >
            <View style={styles.radioCircle}>
              {isSignUp && <View style={styles.selectedRb} />}
            </View>
            <Text
              style={isSignUp ? styles.radioTextSelected : styles.radioText}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          {error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.header}>
            {isSignUp
              ? "Create an account with your email and password"
              : "Log in with your email and password"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}
          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center", padding: 10 }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ fontSize: 16, color: "#2F4F4F" }}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Please make sure to read and understand these documents before
            proceeding. Your use of our service is subject to these terms and
            policies.
          </Text>
        </View>
        <View style={{ marginTop: 100 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}
            >
              |
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Privacy
              </Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}
            >
              |
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Help
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#404040",
              marginTop: 10,
            }}
          >
            © {new Date().getFullYear()} Ebookd, Inc.
          </Text>
        </View>
      </ScrollView>
      <Modal
        isVisible={modalVisible}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection="down"
        style={styles.modal}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="arrow-back" size={34} color="black" />
            </TouchableOpacity>
            <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
            <View>
              <View>
                <Text
                  style={{
                    marginVertical: 10,
                    fontSize: 26,
                    textAlign: "center",
                  }}
                >
                  Password assistance
                </Text>
                <Text style={{ fontSize: 18 }}>
                  Enter your email associated with your account.
                </Text>
                <View style={{ marginVertical: 20 }}>
                  <Text style={{ fontSize: 18, margin: 5 }}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Reset email"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                </View>
                <Text
                  style={{ fontSize: 16, color: "gray", textAlign: "center" }}
                >
                  We will send you an email with a link to reset your password.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handlePasswordReset}
              >
                <Text style={styles.restButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ bottom: 50 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}
            >
              |
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Privacy
              </Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}
            >
              |
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#404040",
                  textDecorationLine: "underline",
                }}
              >
                Help
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#404040",
              marginTop: 10,
            }}
          >
            © {new Date().getFullYear()} Ebookd, Inc.
          </Text>
        </View>
      </Modal>
      <Modal
        isVisible={isVerificationModalVisible}
        onSwipeComplete={() => setVerificationModalVisible(false)}
        swipeDirection="down"
        style={styles.modal}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setVerificationModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="arrow-back" size={34} color="black" />
            </TouchableOpacity>
            <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
            <View>
              <Text style={{ marginVertical: 10, fontSize: 26, textAlign: "center" }}>
                Verify Your Email
              </Text>
              <Text style={{ fontSize: 18, textAlign: "center" }}>
                A verification email has been sent to {verificationEmail}. Please check your inbox and follow the instructions to verify your email address.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  appNameContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  appName: {
    fontSize: 46,
    fontWeight: "bold",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
  header: {
    fontSize: 16,
    textAlign: "left",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    padding: 10,
    marginVertical: 10,
  },
  radioButtonSelected: {
    borderColor: "grey",
  },
  radioText: {
    fontSize: 22,
    color: "gray",
  },
  radioTextSelected: {
    fontSize: 24,
    fontWeight: "bold",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "gray",
  },
  formContainer: {
    padding: 4,
    width: "100%",
  },
  authButton: {
    backgroundColor: "#D3D3D3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  authButtonDisabled: {
    backgroundColor: "gray",
  },
  authButtonText: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "gray",
  },
  footer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#404040",
  },
  modal: {
    margin: 0,
  },
  modalContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    top: "10%",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  closeButton: {
    top: 10,
    left: 10,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#DCDCDC",
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  restButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
