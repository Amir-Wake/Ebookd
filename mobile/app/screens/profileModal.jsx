import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { auth } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import * as ImageManipulator from "expo-image-manipulator";
import Modal from "react-native-modal";

export default function ProfileModal() {
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("Unknown");
  const email = auth.currentUser?.email || "";
  const router = useRouter();
  const storage = getStorage();
  const firestore = getFirestore();
  const [newName, setNewName] = useState("");
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const userDoc = doc(firestore, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profileImageUrl) {
          setProfileImage({ uri: data.profileImageUrl });
        }
        if (data.name) {
          setUsername(data.name);
          setNewName(data.name);
        }
      }
    };

    fetchProfileData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photo library to pick an image.");
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      try {
        const resizedImage = await resizeImage(source.uri);
        setProfileImage(resizedImage);
        await uploadImage(resizedImage.uri);
      } catch (error) {
        console.error("Error resizing image:", error);
        Alert.alert("Error", "Failed to resize image");
      }
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.error("Error in resizeImage:", error);
      throw error;
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    await saveImageUrl(downloadURL);
  };

  const saveImageUrl = async (url) => {
    const userDoc = doc(firestore, "users", auth.currentUser.uid);
    await setDoc(userDoc, { profileImageUrl: url }, { merge: true });
  };

  const saveChanges = async () => {
    try {
      await handleSaveName();
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save changes");
      console.error("Error saving changes:", error);
    }
  };

  const handleSaveName = async () => {
    if (newName === username) {
      return;
    }
    const userDoc = doc(firestore, "users", auth.currentUser.uid);
    await setDoc(userDoc, { name: newName }, { merge: true });
    setUsername(newName);
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPasswordModalVisible(false);
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("The password is incorrect");
      } else if (error.code === "auth/invalid-credential") {
        Alert.alert("The password is incorrect");
      } else {
        console.error("Error updating password", error);
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={{ marginTop: Platform.OS == "ios" ? 40 : 40 }}
      ></SafeAreaView>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email"
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                handleSaveName();
              }}
            />
          </View>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage.uri }
                    : require("../assets/images/blank-profile.png")
                }
                style={styles.profileImage}
                cachePolicy={"memory-disk"}
              />
              <Text style={styles.choosePhotoText}>Choose a photo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={styles.saveButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={isPasswordModalVisible}
        onSwipeComplete={() => setPasswordModalVisible(false)}
        swipeDirection="right"
        style={styles.modal}
        animationIn={"slideInRight"}
        animationOut={"slideOutRight"}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setPasswordModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="arrow-back" size={34} color="black" />
            </TouchableOpacity>
            <View style={styles.section}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePassword}
              >
                <Text style={styles.saveButtonText}>Save Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS == "ios" ? 1 : 40,
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  profileContainer: {
    left: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },
  choosePhotoText: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 2,
    paddingHorizontal: 4,
    color: "white",
    alignSelf: "flex-start",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "gray",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#a0a0a0",
  },
  saveButton: {
    backgroundColor: "#E5E8E8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
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
});
