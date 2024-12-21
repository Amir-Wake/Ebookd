import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import FullReader from "./components/epubReader/fullReader";

export default function BookModal() {
  const router = useRouter();
  const { fileUrl } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <FullReader src={fileUrl} />
    </View>
  );
}
