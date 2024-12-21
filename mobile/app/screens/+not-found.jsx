import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <Text>the page is not found</Text>
      <Button title="Go Home" onPress={() => router.back()} />
    </View>
  );
}
