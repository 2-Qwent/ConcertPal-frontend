import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { deletePost, setPosts } from "../reducers/post";
import moment from "moment";
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import 'moment/locale/fr'; // Import French locale for moment.js

export default function Post(props) {
  const user = useSelector((state) => state.user.value);
  const token = user.token;
  const [trashIcon, setTrashIcon] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  moment.locale('fr'); // Heure en français
  const formattedDate = moment(props.date).fromNow();

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [ comments, setComments ] = useState([])

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

  // ───── ⋆ ───── Poster un commentaire ───── ⋆ ─────
  const handleSubmitComment = () => {
    if (!commentText) return

    fetch(
      `http://${process.env.EXPO_PUBLIC_IP}:3000/comments/${token}/${props._id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentText,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          console.log('commenté :', data.comment)
          setCommentText('')
          fetchComments()
          props.reloadFunction()
        } else {
          console.error("Erreur lors de l'envoi :", data.error)
        }
      })
      .catch((err) => {
        console.error('Erreur :', err)
      });
  };

  // ───── ⋆ ───── Fetch les commentaires ───── ⋆ ─────
  const fetchComments = () => [
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/comments/post/${props._id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setComments(data.comments)
        } else {
          console.error("Erreur lors de la récupération des commentaires :", data.error)
        }
      })
      .catch((err) => {
        console.error('Erreur :', err)
      }),
  ]

  useEffect(() => {
    if (showCommentInput) {
      fetchComments()
    }
  }, [showCommentInput])

  const commentsList = comments.map((comment, i) => {
    const formattedDate = moment(comment.date).fromNow()
    return (
      <View key={i} style={styles.commentContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.username}>{comment.author.username}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <Text style={styles.postText}>{comment.text}</Text>
        <View style={styles.icons}>
          <TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <FontAwesome
                style={{ marginHorizontal: 20 }}
                name= 'reply'
                size={18}
              />
              <Text>0</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity>
              <FontAwesome
                style={{
                  color: '#1D0322',
                  marginHorizontal: 20,
                }}
                name="heart"
                size={18}
              />
            </TouchableOpacity>
            <Text>0 like. Zero.</Text>
          </View>
          {trashIcon && (
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => handleDeletePost()}>
              <FontAwesome
                style={{ marginHorizontal: 20, color: '#565656' }}
                name="trash"
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  })

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
          <TouchableOpacity
            onPress={() => {
              setShowCommentInput((showComments) => {
                const newDisplay = !showComments;
                if (!newDisplay) {
                  setComments([]);
                }
                return newDisplay;
              });
            }}>
            <View style={{ flexDirection: 'row' }}>
              <FontAwesome
                style={{ marginHorizontal: 20 }}
                name={comments.length > 0 ? 'close' : 'reply'}
                size={18}
              />
              <Text>{props.nbComs}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => handleLikePost()}>
              <FontAwesome
                style={{
                  color: props.isLiked ? '#F16364' : '#1D0322',
                  marginHorizontal: 20,
                }}
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
              <FontAwesome
                style={{ marginHorizontal: 20, color: '#565656' }}
                name="trash"
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>

        {/*───── ⋆ ───── Comments ───── ⋆ ─────*/}
        {showCommentInput && (
          <View style={{marginVertical: 10}}>
            <TextInput
              style={styles.input}
              placeholder="Ajouter un commentaire..."
              value={commentText}
              multiline
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              style={styles.button}>
              <Text style={{ color: '#ffffff' }}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        )}
        {comments.length > 0 && <LinearGradient
                  colors={['rgba(165,236,192,0.2)', 'rgb(245, 245, 245)']}
                  style={styles.gradient}>{commentsList}</LinearGradient>}
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
  username: {
    fontWeight: '500',
    fontSize: 15,
  },
  date: {
    color: '#565656',
    fontSize: 12,
  },
  postText: {
    marginBottom: 5,
    fontSize: 13,
    color: '#464646',
    left: 10,
  },
  icons: {
    flexDirection: 'row',
    margin: 5,
  },
  button: {
    width: 100,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A5ECC0',
    borderRadius: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#A5ECC0',
    marginBottom: 15,
    paddingVertical: 5,
  },
  commentContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
    marginLeft: 5,
    marginRight: 5,
  }
});