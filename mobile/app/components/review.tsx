import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { auth } from "../../../firebase";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Image } from "expo-image";
import Modal from "react-native-modal";

interface ReviewProps {
  bookId: string;
}

const Review: React.FC<ReviewProps> = ({ bookId }) => {
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books/`;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const firestore = getFirestore();
  interface Review {
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdDate: string;
    userName: string;
    userImage: string;
  }
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review[]>([]);
  const user = auth.currentUser;

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${apiLink}${bookId}/reviews`);
      const reviewsWithUserDetails = await Promise.all(
        response.data
          .filter((review: any) => review.userId !== user?.uid) // Filter out current user's review
          .slice(-3)
          .map(async (review: any) => {
            const userDoc = await getDoc(doc(firestore, "users", review.userId));
            const userData = userDoc.data();
            return {
              ...review,
              userName: userData?.name || "Anonymous",
              userImage: userData?.profileImageUrl || "",
            };
          })
      );
      setReviews(reviewsWithUserDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchUserReview = async () => {
      try {
        const response = await axios.get(`${apiLink}${bookId}/${user.uid}`);
        if (response.data) {
          const reviewsWithUserDetails = await Promise.all(
            response.data.map(async (review: any) => {
              const userDoc = await getDoc(
                doc(firestore, "users", review.userId)
              );
              const userData = userDoc.data();
              return {
                ...review,
                userName: userData?.name || "Anonymous",
                userImage: userData?.profileImageUrl || "",
              };
            })
          );
          setUserReview(reviewsWithUserDetails);
        }
      } catch (error) {
        console.error("Error fetching user review:", error);
      }
    };

    fetchUserReview();
  }, [user]);

  const handleSubmit = async () => {
    if (!rating) {
      return;
    }
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const reviewData = {
        rating,
        title,
        comment,
        userId: user.uid,
      };
      const response = await axios.post(
        `${apiLink}${bookId}/reviews`,
        reviewData
      );
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
      const newReview = {
        ...reviewData,
        id: response.data.id,
        userName: userData?.name || "Anonymous",
        userImage: userData?.profileImageUrl || "",
        createdDate: new Date().toISOString(),
      };
      setUserReview([newReview]);
      setRating(0);
      setTitle("");
      setComment("");
      setModalVisible(false);
      fetchReviews(); // Refresh reviews after adding a new review
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      setTimeout(async () => {
        await axios.delete(`${apiLink}${bookId}/reviews/${id}`);
        setUserReview(userReview.filter((review) => review.id !== id));
        fetchReviews();
      }, 1000);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      {reviews.map((review, index) => (
        <View key={index} style={{ marginVertical: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {review.userImage ? (
              <Image
                source={{ uri: review.userImage }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="black" />
            )}
            <Text style={{ fontSize: 18, padding: 8 }}>{review.userName}</Text>
          </View>
          <View style={{ flexDirection: "row", marginVertical: 4 }}>
            {[...Array(5)].map((_, starIndex) => (
              <FontAwesome
                key={starIndex}
                name={starIndex < review.rating ? "star" : "star-o"}
                size={24}
                color="gold"
              />
            ))}
          </View>
          <Text style={{ paddingVertical: 4, fontWeight: "300" }}>
            {review.createdDate ? review.createdDate.slice(0, 17) : ""}
          </Text>
          <Text
            style={{ fontSize: 20, fontWeight: "bold", paddingVertical: 4 }}
          >
            {review.title}
          </Text>
          <Text style={{ fontSize: 20 }}>{review.comment}</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
        </View>
      ))}
      {userReview.length === 0 ? (
        <TouchableOpacity
          style={styles.openButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.openButtonText}>Write a Review</Text>
        </TouchableOpacity>
      ) : (
        userReview.map((review, index) => (
          <View key={index} style={{ marginVertical: 8 }}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleDeleteReview(review.id)}
            >
              <Text style={styles.removeButtonText}>Remove Review</Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {review.userImage ? (
                  <Image
                    source={{ uri: review.userImage }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="black"
                  />
                )}
                <Text style={{ fontSize: 18, padding: 8 }}>
                  {review.userName}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", marginVertical: 4 }}>
              {[...Array(5)].map((_, starIndex) => (
                <FontAwesome
                  key={starIndex}
                  name={starIndex < (review.rating ?? 0) ? "star" : "star-o"}
                  size={24}
                  color="gold"
                />
              ))}
            </View>
            <Text style={{ paddingVertical: 4, fontWeight: "300" }}>
              {review.createdDate ? review.createdDate.slice(0, 17) : ""}
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", paddingVertical: 4 }}
            >
              {review.title}
            </Text>
            <Text style={{ fontSize: 20 }}>{review.comment}</Text>
          </View>
        ))
      )}
      <Modal
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        isVisible={modalVisible}
        onSwipeComplete={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.textStyle}>X</Text>
          </Pressable>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Write a review</Text>
            <View style={{ flexDirection: "row", marginVertical: 8 }}>
              {[...Array(5)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setRating(index + 1)}
                >
                  <FontAwesome
                    name={index < rating ? "star" : "star-o"}
                    size={45}
                    color="gold"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                width: "100%",
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <TextInput
                style={{
                  width: "100%",
                  height: 40,
                  paddingHorizontal: 100,
                  textAlign: "center",
                }}
                placeholder="Review Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#888"
              />
              <View
                style={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }}
              />
              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Share your thoughts about this book"
                value={comment}
                onChangeText={setComment}
                multiline
                placeholderTextColor="#888"
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: "#ccc",
    width: "100%",
    padding: 10,
  },
  submitButton: {
    backgroundColor: "#E5E8E8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  submitButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  openButton: {
    backgroundColor: "#E5E8E8",
    borderRadius: 10,
    alignSelf: "center",
    width: "100%",
    padding: 15,
    elevation: 2,
  },
  openButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
  },
  removeButton: {
    backgroundColor: "#E5E8E8",
    position: "absolute",
    top: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    padding: 5,
    elevation: 2,
  },
  removeButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "100%",
    height: "90%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    alignSelf: "flex-end",
    right: 20,
  },
  textStyle: {
    color: "white",
    fontSize: 31,
    fontWeight: "bold",
    textAlign: "right",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Review;
