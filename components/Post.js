import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";

export default function Post(props) {
  const user = useSelector((state) => state.user.value);
  const token = user.token;
  const [trashIcon, setTrashIcon] = useState(false);

  useEffect(() => {
    if (props.author.token === token) {
      setTrashIcon(true);
    }
  }, []);

  const handleLikeTweet = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        _id: props._id,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        props.reloadFunction();
      });
  };

  const handleDeleteTweet = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${props._id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        props.reloadFunction();
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text>{props.username}</Text>
        <Text>{props.date}</Text>
      </View>
      <Text>{props.text}</Text>
      <View style={styles.icones}>
        <TouchableOpacity>
          <FontAwesome name="reply" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLikeTweet()}>
          <FontAwesome
            style={{ color: props.isLiked ? "red" : "black" }}
            name="heart"
          />
        </TouchableOpacity>
        <Text>{props.nbLikes}</Text>
        {trashIcon && (
          <TouchableOpacity onPress={() => handleDeleteTweet()}>
            <FontAwesome name="trash" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: "black",
    borderWidth: 1,
    width: "80%",
    height: 100,
  },
  info: {
    flex: 1,
    flexDirection: "row",
  },
  icones: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 5,
  },
});
