import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  Keyboard,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import ActionSheet from "react-native-actions-sheet";
import { SearchBar } from "react-native-elements";
import { Image } from "expo-image";

export default function Library() {
  const [books, setBooks] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const actionSheetRef = React.useRef(null);
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!isSearching) {
      fetchBooks();
      const interval = setInterval(async () => {
        const directory = `${FileSystem.documentDirectory}books/`;
        const bookFolders = await FileSystem.readDirectoryAsync(directory);
        if (bookFolders.length !== books.length) {
          fetchBooks();
        }
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const fetchBooks = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}books/`;
      const directoryInfo = await FileSystem.getInfoAsync(directory);

      if (!directoryInfo.exists) {
        setBooks([]);
        return;
      }

      const bookFolders = await FileSystem.readDirectoryAsync(directory);

      const bookData = await Promise.all(
        bookFolders.map(async (folder) => {
          const coverImagePath = `${directory}${folder}/${folder}.jpg`;
          const filePath = `${directory}${folder}/${folder}.epub`;
          const coverImageExists = await FileSystem.getInfoAsync(
            coverImagePath
          );
          const fileExists = await FileSystem.getInfoAsync(filePath);

          if (coverImageExists.exists && fileExists.exists) {
            return {
              title: folder,
              coverImagePath,
              filePath,
            };
          }
          return null;
        })
      );

      setBooks(bookData.filter((book) => book !== null));
    } catch (error) {
      console.error("Error reading books directory:", error);
      Alert.alert("Error", "Failed to read books directory");
    }
  };

  const updateSearch = (search) => {
    setSearch(search);
    if (search === "") {
      setIsSearching(false);
      fetchBooks();
    } else {
      setIsSearching(true);
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(search.toLowerCase())
      );
      setBooks(filteredBooks);
    }
  };

  const confirmDeleteBook = (folder) => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteBook(folder) },
      ],
      { cancelable: false }
    );
  };

  const deleteBook = async (folder) => {
    try {
      const directory = `${FileSystem.documentDirectory}books/${folder}`;
      await FileSystem.deleteAsync(directory, { idempotent: true });
      fetchBooks();
      actionSheetRef.current?.setModalVisible(false); // Close the ActionSheet
    } catch (error) {
      console.error("Error deleting book folder:", error);
      Alert.alert("Error", "Failed to delete book folder");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookContainer}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/bookModal",
            params: { fileUrl: item.filePath },
          })
        }
        onLongPress={() => {
          setSelectedBook(item);
          actionSheetRef.current?.setModalVisible(true);
        }}
      >
        <Image
          source={{ uri: item.coverImagePath }}
          style={styles.bookImage}
          cachePolicy={"memory-disk"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchBar
        placeholder="Search for a book..."
        onChangeText={updateSearch}
        value={search}
        searchIcon={{ size: 24 }}
        lightTheme
        round
        containerStyle={{
          backgroundColor: "transparent",
          top: Platform.OS == "ios" ? 0 : 40,
        }}
        inputContainerStyle={{ backgroundColor: "white" }}
      />
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.container}
        onScrollBeginDrag={Keyboard.dismiss}
      />
      <ActionSheet ref={actionSheetRef}>
        <View style={styles.actionSheetContent}>
          <Text style={styles.actionSheetTitle}>{selectedBook?.title}</Text>
          <TouchableOpacity style={styles.actionSheetButton}>
            <Text style={styles.actionSheetButtonText}>Add to collection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetButton}
            onPress={() => confirmDeleteBook(selectedBook?.title)}
          >
            <Text style={[styles.actionSheetButtonText, styles.deleteText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    top: Platform.OS == "ios" ? 0 : 20,
  },
  bookContainer: {
    flex: 1,
    margin: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bookImage: {
    width: 150,
    height: 250,
    contentFit: "contentFit",
    borderRadius: 10,
  },
  linkText: {
    color: "blue",
    marginTop: 10,
  },
  deleteText: {
    color: "red",
  },
  actionSheetContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  actionSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  actionSheetButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: "95%",
    alignItems: "center",
  },
  actionSheetButtonText: {
    fontSize: 22,
  },
});
