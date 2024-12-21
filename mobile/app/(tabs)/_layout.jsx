import { Tabs, Stack } from "expo-router";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarActiveTintColor: "black", 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color="black"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarActiveTintColor: "black", 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              color="black"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarActiveTintColor: "black",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color="black"
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
