import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { deletePost, setPosts } from "../reducers/post";
import moment from "moment";

export default function Post(props) {
  const user = useSelector((state) => state.user.value);
  const token = user.token;
  const [trashIcon, setTrashIcon] = useState(false);
  const dispatch = useDispatch();
  const formattedDate = moment(props.date).fromNow();

  //affiche l'icone de suppression si le token de l'auteur correspond à celui de l'utilisateur
  useEffect(() => {
    if (props.author.token === token) {
      setTrashIcon(true);
    }
  }, []);

  //like un post
  const handleLikePost = () => {
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
        fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts`)
          .then((response) => response.json())
          .then((data) => {
            dispatch(setPosts(data.posts));
          });
        props.reloadFunction();
      });
  };

  //supprimer un post
  const handleDeletePost = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${props._id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        dispatch(deletePost(props._id));
        props.reloadFunction();
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text>{props.username}</Text>
        <Text>{formattedDate}</Text>
      </View>
      <Text>{props.text}</Text>
      <View style={styles.icones}>
        <TouchableOpacity>
          <FontAwesome name="reply" size={18}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLikePost()}>
          <FontAwesome
            style={{ color: props.isLiked ? "red" : "black" }}
            name="heart"
            size={18}
          />
        </TouchableOpacity>
        <Text>{props.nbLikes}</Text>
        {trashIcon && (
          <TouchableOpacity onPress={() => handleDeletePost()}>
            <FontAwesome name="trash" size={18}/>
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
    width: "100%",
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
