import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Themes, useReader } from "@epubjs-react-native/core";
import { IconButton, MD3Colors } from "react-native-paper";
import { MAX_FONT_SIZE, MIN_FONT_SIZE, themes } from "./utils";

interface Props {
  currentFontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  switchTheme: () => void;
  onPressSearch: () => void;
  switchFontFamily: () => void;
  onOpenBookmarksList: () => void;
  onOpenTocList: () => void;
}

export default function Header({
  currentFontSize,
  increaseFontSize,
  decreaseFontSize,
  switchTheme,
  onPressSearch,
  switchFontFamily,
  onOpenBookmarksList,
  onOpenTocList,
}: Props) {
  const navigation = useNavigation();
  const {
    theme,
    bookmarks,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
    isBookmarked,
  } = useReader();

  const [showSettings, setShowSettings] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundColor = theme.body.background;
  const [iconCol, setIconCol] = useState(MD3Colors.neutral50);

  const handleIconColor = () => {
    if (backgroundColor == "#fff") {
      setIconCol(MD3Colors.neutral100);
    }
    if (backgroundColor == "#333") {
      setIconCol(MD3Colors.neutral10);
    }
  };

  const handleChangeBookmark = () => {
    const location = getCurrentLocation();

    if (!location) return;

    if (isBookmarked) {
      const bookmark = bookmarks.find(
        (item) =>
          item.location.start.cfi === location?.start.cfi &&
          item.location.end.cfi === location?.end.cfi
      );

      if (!bookmark) return;
      removeBookmark(bookmark);
    } else addBookmark(location);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowSettings(false);
    }, 5000);
  };

  useEffect(() => {
    if (showSettings) {
      resetTimeout();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showSettings]);

  return (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        iconColor={iconCol}
        size={30}
        onPress={() => {
          navigation.goBack();
          resetTimeout();
        }}
      />

      <View style={styles.actions}>
        <IconButton
          icon={isBookmarked ? "bookmark" : "bookmark-outline"}
          iconColor={iconCol}
          size={30}
          animated
          onPress={() => {
            handleChangeBookmark();
            resetTimeout();
          }}
          onLongPress={() => {
            onOpenBookmarksList();
            resetTimeout();
          }}
        />

        <IconButton
          icon={showSettings ? "cog" : "cog-outline"}
          iconColor={iconCol}
          size={30}
          onPress={() => {
            toggleSettings();
            resetTimeout();
          }}
        />
      </View>

      {showSettings && (
        <View
          style={[styles.settingsContainer, { backgroundColor: "transparent" }]}
        >
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                onOpenTocList();
                setShowSettings(false);
              }}
            >
              <IconButton
                icon="format-list-bulleted-square"
                iconColor={iconCol}
                size={30}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                switchTheme();
                resetTimeout();
                handleIconColor();
              }}
            >
              <IconButton
                icon="theme-light-dark"
                iconColor={iconCol}
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                onPressSearch();
                resetTimeout();
              }}
            >
              <IconButton icon="magnify" iconColor={iconCol} size={40} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                increaseFontSize();
                resetTimeout();
              }}
              disabled={currentFontSize === MAX_FONT_SIZE}
            >
              <IconButton
                icon="format-font-size-increase"
                iconColor={iconCol}
                size={30}
                animated={true}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                decreaseFontSize();
                resetTimeout();
              }}
              disabled={currentFontSize === MIN_FONT_SIZE}
            >
              <IconButton
                icon="format-font-size-decrease"
                iconColor={iconCol}
                size={30}
                animated
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme === Themes.DARK
                      ? MD3Colors.neutral100
                      : MD3Colors.neutral10,
                },
              ]}
              onPress={() => {
                switchFontFamily();
                resetTimeout();
              }}
            >
              <IconButton icon="format-font" iconColor={iconCol} size={30} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  settingsContainer: {
    position: "absolute",
    top: 60,
    right: 0,
    zIndex: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    padding: 10,
    marginHorizontal: 20,
    justifyContent: "space-between",
    width: "100%",
  },
  circle: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
