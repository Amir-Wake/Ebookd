import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const BookScreen = lazy(() => import("./components/home/bookScreen"));

const BookSheet = () => {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { index, apiLink } = useLocalSearchParams();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(apiLink);
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : [data]);
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [apiLink]);

  if (loading) {
    return <View style={styles.loadingContainer}></View>;
  }

  if (!books || books.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>No books available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.bookSheetContainer} edges={["left", "right"]}>
      <Carousel
        autoPlay={false}
        data={books}
        height={height}
        defaultIndex={index}
        loop={false}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        panGestureHandlerProps={{
          activeOffsetX: [-30, 30],
          activeOffsetY: [-10, 10],
        }}
        width={width}
        renderItem={({ index }) => (
          <View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={styles.container}
                entering={FadeInDown.duration(200).springify()}
              >
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                  <BookScreen book={books[index]} />
                </Suspense>
              </Animated.View>
            </ScrollView>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    borderColor: "black",
    minHeight: height,
    borderWidth: 2,
    flex: 1,
    padding: 15,
    backgroundColor: "#F8F8FF",
    borderRadius: 20,
  },
  bookSheetContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closeButton: {
    right: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(BookSheet);
