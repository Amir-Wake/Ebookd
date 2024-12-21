import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { Image } from "expo-image";

export default function Profile() {
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const firestore = getFirestore();
  let unsubscribeSnapshot = null;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDoc = doc(firestore, "users", auth.currentUser.uid);
        unsubscribeSnapshot = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profileImageUrl) {
              setProfileImage({ uri: data.profileImageUrl });
            }
            if (data.name) {
              setUsername(data.name);
            } else {
              setUsername("Unknown");
            }
          } else {
            setUsername("Unknown");
          }
        });
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      unsubscribeAuth();
    };
  }, []);

  const handleSignOut = async () => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{ marginTop: Platform.OS == "ios" ? 40 : 40 }}
      ></SafeAreaView>
      <View style={styles.profileContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage.uri }
              : require("../../assets/images/blank-profile.png")
          }
          style={styles.profileImage}
          cachePolicy={"memory-disk"}
        />
        <Text style={styles.username}>{username}</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("/profileModal")}
        >
          <Text style={styles.optionText}>Update Profile</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Manage Connected Accounts</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notification Settings</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Theme</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Language</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>About the App</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Terms and Conditions</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Contact Support</Text>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>FAQs</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profileContainer: {
    borderRadius: 10,
    backgroundColor: "#E5E8E8",
    padding: 10,
    alignItems: "left",
    flexDirection: "row",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 10,
  },
  section: {
    marginVertical: 10,
    backgroundColor: "#E5E8E8",
    borderRadius: 10,
    overflow: "hidden",
  },
  option: {
    paddingVertical: 10,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  signOutButton: {
    backgroundColor: "#ff3b30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
