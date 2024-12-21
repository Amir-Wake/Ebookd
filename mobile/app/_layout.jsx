import { Tabs, Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          ptions={{
            title: "Login",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="bookSheet"
          options={{
            title: "BookSheet",
            presentation: "transparentModal",
            gestureEnabled: false,
          }}
        />
                <Stack.Screen
          name="login"
          options={{
            title: "Login",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="bookModal"
          options={{
            title: "BookModal",
            presentation: "fullScreenModal",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="profileModal"
          options={{
            title: "ProfileModal",
            presentation: "modal",
            gestureEnabled: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
