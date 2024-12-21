import React, { useEffect } from 'react';
import { Button, TextInput, useWindowDimensions, View } from 'react-native';
import { ReaderProvider, Reader, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import  Header  from './Header';
import  BookmarksList  from './BookmarksList';

export default function Bookmarks() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme, changeFontSize, changeFontFamily, changeTheme, goToLocation,
    currentLocation, totalLocations, bookmarks, getCurrentLocation,goNext,addBookmark,updateBookmark
  } = useReader();

  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const [location, setLocation] = React.useState<string>("");
  const handleSwipeLeft = () => {
  console.log('swipe left', getCurrentLocation());
  };
  const handleSwipeRight = () => {
  console.log('swipe right', getCurrentLocation());
  };
  const handleBookmarkChange = () => {
  console.log('bookmark change', bookmarks);
  }
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ReaderProvider>
        <Header onOpenBookmarksList={() => bottomSheetRef.current?.present()} />

        <Reader
          src="https://keubo.s3.us-east-1.amazonaws.com/killer.epub"
          width={width}
          height={height}
          fileSystem={useFileSystem}
          waitForLocationsReady
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onChangeBookmarks={handleBookmarkChange}
        />

        <BookmarksList
          ref={bottomSheetRef}
          onClose={() => bottomSheetRef.current?.dismiss()}
        />
         <View style={{ flexDirection: 'row', padding: 10 }}>
          <TextInput
            style={{
              flex: 1,
              borderColor: 'gray',
              borderWidth: 1,
              padding: 8,
              marginRight: 10,
            }}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
          />
          <Button title="Go" onPress={() => goToLocation(location)} />
        </View>
      </ReaderProvider>
    </GestureHandlerRootView>
  );
}