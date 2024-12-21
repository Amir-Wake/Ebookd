import React, { useState, useEffect } from "react";
import { useWindowDimensions, View, Platform, Button } from "react-native";
import {
  ReaderProvider,
  Reader,
  useReader,
  Themes,
  Bookmark,
} from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "./Header";
import Footer from "./Footer";
import { MAX_FONT_SIZE, MIN_FONT_SIZE, availableFonts, themes } from "./utils";
import BookmarksList from "../Bookmarks/BookmarksList";
import TableOfContents from "../TableOfContents/TableOfContents";
import SearchList from "../Search/SearchList";

interface ComponentProps {
  src: string;
}

function Component({ src }: ComponentProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    theme,
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    currentLocation,
    totalLocations,
    bookmarks,
    getCurrentLocation,
    goNext,
    addBookmark,
    updateBookmark,
  } = useReader();

  const bookmarksListRef = React.useRef<BottomSheetModal>(null);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const searchListRef = React.useRef<BottomSheetModal>(null);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [currentFontFamily, setCurrentFontFamily] = useState(availableFonts[0]);
  const [defTheme, setDefTheme] = useState(Themes.LIGHT);
  const [bookmarkData, setBookmarkData] = useState<Bookmark[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [locationActive, setLocationActive] = useState(false);

  useEffect(() => {
    if (bookmarks && isActive) {
      setBookmarkData(bookmarks);
      handleUpdateBookmark();
    }
  }, [bookmarks]);

  useEffect(() => {
    if (currentLocation && locationActive) {
      handleLocationChange();
    }
  }, [currentLocation]);

  useEffect(() => {
    const getStoredTheme = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem(`bookmarks_${src}`);
        const storedTheme = await AsyncStorage.getItem("currentTheme");
        if (storedTheme) {
          setDefTheme(JSON.parse(storedTheme));
        }
        if (storedBookmarks) {
          const bookmarksStored = JSON.parse(storedBookmarks);
          setBookmarkData(bookmarksStored.bookmarks);
        }
      } catch (error) {
        console.error("Failed to retrieve stored theme", error);
      }
    };

    getStoredTheme();
  }, []);

  const storePreference = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to save preference", error);
    }
  };

  const increaseFontSize = () => {
    if (currentFontSize < MAX_FONT_SIZE) {
      setCurrentFontSize(currentFontSize + 1);
      changeFontSize(`${currentFontSize + 1}px`);
    }
  };

  const decreaseFontSize = () => {
    if (currentFontSize > MIN_FONT_SIZE) {
      setCurrentFontSize(currentFontSize - 1);
      changeFontSize(`${currentFontSize - 1}px`);
    }
  };

  const switchTheme = () => {
    const index = Object.values(themes).indexOf(theme);
    const nextTheme =
      Object.values(themes)[(index + 1) % Object.values(themes).length];
    changeTheme(nextTheme);
    storePreference("currentTheme", JSON.stringify(nextTheme));
  };

  const switchFontFamily = () => {
    const index = availableFonts.indexOf(currentFontFamily);
    const nextFontFamily = availableFonts[(index + 1) % availableFonts.length];
    setCurrentFontFamily(nextFontFamily);
    changeFontFamily(nextFontFamily);
  };

  const handleLocationChange = async () => {
    try {
      const locationData = JSON.stringify({
        src,
        cfi: currentLocation?.end.cfi,
      });
      await AsyncStorage.setItem(`${src}`, locationData);
    } catch (error) {
      console.error("Failed to save location", error);
    }
  };

  const handleUpdateBookmark = async () => {
    if (bookmarks) {
      try {
        const bookmarkData = JSON.stringify({ src, bookmarks: bookmarks });
        await AsyncStorage.setItem(`bookmarks_${src}`, bookmarkData);
      } catch (error) {
        console.error("Failed to save location", error);
      }
    }
  };

  const handleLocationReady = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem(`${src}`);
      if (storedLocation) {
        const location = JSON.parse(storedLocation);
        goToLocation(location.cfi);
        setIsActive(true);
      }
    } catch (error) {
      console.error("Failed to retrieve stored location", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? insets.top - 20 : insets.top,
        paddingBottom: insets.bottom - 20,
        backgroundColor: theme.body.background,
      }}
    >
      <Header
        currentFontSize={currentFontSize}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        switchTheme={switchTheme}
        switchFontFamily={switchFontFamily}
        onPressSearch={() => searchListRef.current?.present()}
        onOpenBookmarksList={() => bookmarksListRef.current?.present()}
        onOpenTocList={() => bottomSheetRef.current?.present()}
      />
      <View style={{ flex: 1, top: -10 }}>
        <Reader
          src={src}
          width={width}
          height={height * 0.87}
          enableSelection={true}
          fileSystem={useFileSystem}
          defaultTheme={defTheme}
          waitForLocationsReady
          onSwipeLeft={() => setLocationActive(true)}
          onSwipeRight={() => setLocationActive(true)}
          onLocationsReady={handleLocationReady}
          onChangeBookmarks={handleUpdateBookmark}
          initialBookmarks={bookmarkData}
        />
        <SearchList
          ref={searchListRef}
          onClose={() => searchListRef.current?.dismiss()}
        />
        <BookmarksList
          ref={bookmarksListRef}
          onClose={() => bookmarksListRef.current?.dismiss()}
        />

        <TableOfContents
          ref={bottomSheetRef}
          onPressSection={(section) => {
            goToLocation(section.href.split("/")[1]);
            bottomSheetRef.current?.dismiss();
          }}
          onClose={() => bottomSheetRef.current?.dismiss()}
        />
      </View>
      <Footer />
    </View>
  );
}

interface FullReaderProps {
  src: string;
}

export default function FullReader({ src }: FullReaderProps) {
  return (
    <ReaderProvider>
      <Component src={src} />
    </ReaderProvider>
  );
}
