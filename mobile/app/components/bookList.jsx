import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, memo } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

const BookList = ({ title, description, genre }) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}${genre}`;

  useEffect(() => {
    fetch(apiLink)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [genre]);

  if (loading) {
    return;
  }

  return (
    <View
      style={{
        marginBottom: 0,
        paddingBottom: 10,
        spaceY: 16,
        backgroundColor: "#F8F8FF",
        borderWidth: 1,
        borderColor: "#A9A9A9",
      }}
    >
      <View
        style={{
          marginHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "black", paddingTop: 6, fontSize: 24 }}>
          {" "}
          {title}
        </Text>
      </View>
      <View
        style={{
          marginHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "black", paddingBottom: 6, fontSize: 16 }}>
          {" "}
          {description}
        </Text>
      </View>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={{ spaceY: 4, marginRight: 10, marginTop: 10 }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "bookSheet",
                  params: { apiLink: apiLink, index },
                })
              }
            >
              <Image
                source={{ uri: item.coverImageUrl }}
                style={{
                  width: width * 0.34,
                  height: height * 0.22,
                  borderRadius: 10,
                }}
                cachePolicy={"memory-disk"}
                placeholder={require('../../../assets/images/placeholder.jpg')}
                contentFit="cover"
                transition={1000}
              />
              <Text style={{ color: "black", fontSize: 18 }}>
                {item.title.length > 14
                  ? `${item.title.substring(0, 14)}...`
                  : item.title}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default memo(BookList);
