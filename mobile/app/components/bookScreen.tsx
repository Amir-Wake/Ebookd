import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { ScrollView } from "react-native-gesture-handler";
import { Image } from "expo-image";
import Review from "./review";
const { width, height } = Dimensions.get("window");

interface Book {
  id: string;
  coverImageUrl: string;
  title: string;
  author: string;
  shortDescription: string;
  longDescription: string;
  printLength: number;
  language: string;
  publicationDate: string;
  publisher: string;
  translator: string;
  fileUrl: string;
  reviewCount: number;
  averageRating: number;
}

const BookScreen = ({ book }: { book: Book }) => {
  const [showMore, setShowMore] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFileExistence = async () => {
      const directory = `${FileSystem.documentDirectory}books/${book.title}/`;
      const filePath = `${directory}${book.title}.epub`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        setIsDownloaded(true);
      } else {
        setIsDownloaded(false);
      }
    };

    checkFileExistence();
  }, [book.title]);

  const handleDownload = async () => {
    setIsDownloading(true);
    const directory = `${FileSystem.documentDirectory}books/${book.title}/`;

    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

      const downloadResumable = FileSystem.createDownloadResumable(
        book.fileUrl,
        `${directory}${book.title}.epub`,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        await FileSystem.downloadAsync(
          book.coverImageUrl,
          `${directory}${book.title}.jpg`
        );
        setIsDownloaded(true);
      } else {
        console.error("Download failed");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.coverImageUrl }}
            cachePolicy={"memory-disk"}
            style={styles.bookImage}
            placeholder={require('../../../assets/images/placeholder.jpg')}
            contentFit="cover"
            transition={1000}
          />
        </View>
        <View style={styles.headerDetail}>
          <Text style={styles.title}>
            {book.title.length > 48
              ? `${book.title.slice(0, 58)}...`
              : book.title}
          </Text>
          <Text style={styles.author}>By: {book.author}</Text>
          <View style={styles.rating}>
            {[...Array(5)].map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={24}
                color={index < book.averageRating ? "gold" : "gray"}
              />
            ))}
            <Text style={styles.reviewCount}> ({book.reviewCount || 0})</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable>
            <Text style={styles.button}>add</Text>
          </Pressable>
          <Pressable
            onPress={
              isDownloaded
                ? () =>
                    router.push({
                      pathname: "/bookModal",
                      params: {
                        fileUrl: `${FileSystem.documentDirectory}books/${book.title}/${book.title}.epub`,
                      },
                    })
                : handleDownload
            }
          >
            <Text style={styles.button}>
              {isDownloaded
                ? "Read"
                : isDownloading
                ? ` ${Math.round(downloadProgress * 100)}%`
                : "Download"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.horizontalLine} />
        <View>
          <Text style={styles.description}>{book.shortDescription}</Text>
          <Text style={styles.longDescription}>
            {showMore
              ? book.longDescription
              : `${book.longDescription.slice(0, 250)}...`}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMore(!showMore)}
            disabled={isDownloaded || isDownloading}
          >
            <Text style={styles.showMoreText}>
              {showMore ? "Read Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>Pages</Text>
              <FontAwesome name="files-o" size={50} color="black" />
              <Text style={styles.infoText}>{book.printLength}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>Language</Text>
              <FontAwesome name="language" size={50} color="black" />
              <Text style={styles.infoText}>{book.language}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>Publication Date</Text>
              <MaterialIcons name="date-range" size={50} color="black" />
              <Text style={styles.infoText}>{book.publicationDate}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>Publisher</Text>
              <MaterialIcons name="business" size={50} color="black" />
              <Text style={styles.infoText}>{book.publisher}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>Translator</Text>
              <MaterialIcons name="translate" size={50} color="black" />
              <Text style={styles.infoText}>{book.translator}</Text>
            </View>
          </ScrollView>
        </View>
        <Review bookId={book.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  bookImage: {
    width: 180,
    height: 270,
    alignSelf: "flex-start",
  },
  imageContainer: {
    width: 190,
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  headerDetail: {
    width: width * 0.45,
    position: "absolute",
    padding: 4,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    alignSelf: "center",
  },
  author: {
    fontSize: 20,
    paddingTop: 10,
    textAlign: "center",
  },
  rating: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  reviewCount: {
    paddingTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "orange",
    fontSize: 20,
    padding: 10,
    width: 170,
    borderRadius: 5,
    color: "black",
    textAlign: "center",
    marginHorizontal: 5,
    marginTop: 5,
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
  },
  longDescription: {
    marginVertical: 5,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "justify",
  },
  showMoreText: {
    marginVertical: 5,
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: "rgba(248, 248, 255, 0.5)",
    color: "#0096FF",
    textAlign: "left",
    paddingLeft: 10,
  },
  bookInfo: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderTopColor: "gray",
    borderTopWidth: 1,
  },
  infoText: {
    padding: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: 10,
  },
});

export default BookScreen;
