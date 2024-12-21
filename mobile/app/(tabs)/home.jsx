import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StatusBar,
  TextInput,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const PickCards = lazy(() => import("../components/home/pickCards"));
const BookList = lazy(() => import("../components/home/bookList"));

const Index = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastInteraction >= 5000 && showSearch) {
        toggleSearch();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [lastInteraction, showSearch]);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 0);
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery("");
      setLocations([]);
    }
  };

  const fetchBooks = async (search) => {
    try {
      const response = await axios.get(apiLink, {
        params: { search: search },
      });
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert("Error", "Failed to fetch books. Please try again later.");
    } finally {
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    setLastInteraction(Date.now());
    if (text.length > 2) {
      fetchBooks(text);
    } else {
      setLocations([]);
    }
  };

  const toggleSearch = () => {
    setShowSearch(true);
    if (searchQuery === "") {
      setSearchQuery("");
      setLocations([]);
    }
  };

  const handleBookPress = (book) => {
    const newApiLink = `${apiLink}/${book.id}`;
    router.push({
      pathname: "bookSheet",
      params: { index: 0, apiLink: newApiLink },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView
        edges={["right", "left", "bottom", "top"]}
        style={[
          styles.safeArea,
          {
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.95)"
              : "transparent",
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: showSearch ? "white" : "transparent" },
            ]}
          >
            {!showSearch && <Text style={styles.title}>Ebookd</Text>}
            {showSearch && (
              <TextInput
                placeholder="Search book"
                placeholderTextColor="black"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setLastInteraction(Date.now())}
              />
            )}
            <TouchableOpacity
              onPress={toggleSearch}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={30} color="black" />
            </TouchableOpacity>
          </View>
          {locations.length > 0 && showSearch && (
            <View style={styles.searchResults}>
              {locations.map((locs, index) => {
                const showBorder = index + 1 !== locations.length;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.searchResultItem,
                      showBorder && styles.searchResultItemBorder,
                    ]}
                    onPress={() => handleBookPress(locs)}
                  >
                    <Text>{locs.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </SafeAreaView>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View>
            <Animated.View
              entering={FadeInDown.delay(200)
                .duration(500)
                .springify()
                .damping(12)}
            >
              <Suspense>
                <PickCards />
              </Suspense>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(400)
                .duration(500)
                .springify()
                .damping(12)}
            >
              <Suspense >
                <BookList
                  title="Best from fiction"
                  description="Suggestions based on genre."
                  genre="books/genre/fiction"
                />
              </Suspense>
            </Animated.View>
            <Suspense >
              <BookList
                title="Best from science"
                description="See what's popular right now."
                genre="books/genre/science"
              />
              <BookList
                title="Newest"
                description="See newest books"
                genre="newest"
              />
              <BookList
                title="Best from novel"
                description="See what's popular right now."
                genre="books/genre/novel"
              />
            </Suspense>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default memo(Index);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    position: "absolute",
    top: Platform.OS === "ios" ? -20 : -10,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  header: {
    marginBottom: Platform.OS === "ios" ? -25 : 10,
    marginHorizontal: 16,
    position: "relative",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    marginTop: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#DCDCDC",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    paddingLeft: 24,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    paddingLeft: 24,
    flex: 1,
    color: "black",
    fontSize: 16,
    height: 40,
  },
  searchButton: {
    borderRadius: 50,
    padding: 8,
    margin: 4,
    backgroundColor: "#DCDCDC",
  },
  searchResults: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    top: 64,
    borderRadius: 24,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchResultItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  loadingCustomStyle: {
    width: width,
    height: height * 0.64,
    borderColor: "grey",
    borderWidth: 1,
  }
});
