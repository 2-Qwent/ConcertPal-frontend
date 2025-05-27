import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { deletePost, setPosts } from "../reducers/post";
import moment from "moment";
import { useNavigation } from '@react-navigation/native';
import 'moment/locale/fr'; // Import French locale for moment.js

export default function Post(props) {
  const user = useSelector((state) => state.user.value);
  const token = user.token;
  const [trashIcon, setTrashIcon] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  moment.locale('fr'); // Heure en français
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        dispatch(deletePost(props._id));
        props.reloadFunction();
      });
  };

  // ───── ⋆ ───── Naviguer vers le profile d'un autre user ───── ⋆ ─────
  const viewProfile = () => {
    console.log(`clicked to visit ${props.username}'s profile`);
    navigation.navigate('UserProfileScreen', {
      username: props.author.username,
      userToken: props.author.token,
    });
  };

  return (
    <View style={styles.container}>
      {/*───── ⋆ ───── Profile Picture ───── ⋆ ─────*/}
      <View style={styles.profilePic}>
        <FontAwesome name="user-circle" size={45} color="#000000" />
        <Text style={styles.profilePlaceholderPicText}>
          placeholder profile pic
        </Text>
      </View>

      {/*───── ⋆ ───── Post Content ───── ⋆ ─────*/}
      <View style={styles.content}>
        {/* ───── ⋆ ───── Username + Date ───── ⋆ ─────*/}
        <View style={styles.info}>
          <TouchableOpacity onPress={() => viewProfile()}>
            <Text style={styles.username}>{props.username}</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.date}>{formattedDate}</Text>

          </View>
        </View>

        {/* ───── ⋆ ───── post text ───── ⋆ ─────*/}
        <Text style={styles.postText}>{props.text}</Text>

        {/*───── ⋆ ───── Icons ───── ⋆ ─────*/}
        <View style={styles.icons}>
          <TouchableOpacity>
            <FontAwesome style={{marginHorizontal: 20,}} name="reply" size={18} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => handleLikePost()}>
              <FontAwesome
                style={{ color: props.isLiked ? '#F16364' : '#1D0322' , marginHorizontal: 20,}}
                name="heart"
                size={18}
              />
            </TouchableOpacity>
            <Text>{props.nbLikes}</Text>
          </View>
            {trashIcon && (
              <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => handleDeletePost()}>
                <FontAwesome style={{marginHorizontal: 20, color:'#565656'}} name="trash" size={18} />
              </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  profilePic: {
    alignItems: 'center',
    marginRight: 10,
  },
  profilePlaceholderPicText: {
    fontSize: 7,
    color: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  date: {
    color: '#565656',
    fontSize: 12,
  },
  postText: {
    marginBottom: 5,
    fontSize: 14,
  },
  icons: {
    flexDirection: 'row',
    margin: 5,
  },
});