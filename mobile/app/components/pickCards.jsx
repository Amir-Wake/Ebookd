import React, { useEffect, useRef, useState, memo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

const PickCards = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}newest`;

  useEffect(() => {
    fetch(apiLink)
      .then((response) => response.json())
      .then((data) => {
        setData(data.slice(0, 4));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current && data.length > 0) {
        const nextIndex = (currentIndex + 1) % data.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, data]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  const handleCirclePress = (index) => {
    setCurrentIndex(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.loadingCustomStyle}
        size="large"
        color="#0000ff"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          style={styles.containerCustomStyle}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {data.map((item, index) => (
            <View key={item.id} style={styles.bookCardContainer}>
              <LinearGradient
                colors={[item.coverDominantColor || "#F8F8FF", "#F8F8FF"]}
                style={styles.bookCard}
              />
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push({
                    pathname: "bookSheet",
                    params: { apiLink: apiLink, index },
                  })
                }
                style={styles.bookCardContent}
              >
                <Image
                  source={{ uri: item.coverImageUrl }}
                  cachePolicy={"memory-disk"}
                  style={styles.bookImage}
                  placeholder={require('../../../assets/images/placeholder.jpg')}
                  contentFit="cover"
                  transition={1000}
                />
                <Text style={styles.bookAuthorText}>By: {item.author}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.circleBar}>
        {Array.from({ length: data.length }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCirclePress(index)}
            style={styles.touchableCircle}
          >
            <View
              style={[
                styles.circle,
                { opacity: index === currentIndex ? 1 : 0.5 },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default memo(PickCards);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height * 0.7,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerCustomStyle: {
    width: width,
    height: height * 0.64,
  },
  loadingCustomStyle: {
    width: width,
    height: height * 0.64,
    borderColor: "grey",
    borderWidth: 1,
  },
  bookCardContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  bookCard: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bookCardContent: {
    marginTop: "10%",
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  bookImage: {
    width: width * 0.55,
    height: height * 0.4,
    borderRadius: 15,
    shadowColor: "black",
  },
  bookAuthorText: {
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 18,
  },
  circleBar: {
    flexDirection: "row",
    shadowColor: "black",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
  },
  touchableCircle: {
    padding: 5,
  },
  circle: {
    width: 25,
    height: 8,
    borderRadius: 5,
    backgroundColor: "gray",
    marginHorizontal: 5,
  },
  fullScreenView: {
    flex: 1,
    marginTop: Platform.OS == "ios" ? 0 : -50,
    zIndex: 100,
  },
});
