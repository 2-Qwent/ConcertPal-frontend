import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Image } from "react-native";
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
  const [comments, setComments] = useState([])

  const fullConcertName = `${props.concert?.artist} - ${props.concert?.city}`
  const concertName =
    props.concert?.artist && props.concert.artist.length > 15
      ? (`${props.concert?.artist.slice(0, 15) + '...'} - ${props.concert?.city}`)
      : fullConcertName


  const handleConcertNav = () => {
    if (props.concert && props.concert._id) {
      navigation.navigate("ConcertScreen", {
        concertId: props.concert._id,
        artist: props.concert.artist,
        city: props.concert.city,
        venue: props.concert.venue,
        seatmap: props.concert.seatmap,
        pic: props.concert.pic,
        date: props.concert.date,
      });
    }
  };

  //like un post
  const handleLikePost = () => {
    fetch(`https://concert-pal-backend.vercel.app/posts/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        _id: props._id,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetch(`https://concert-pal-backend.vercel.app/posts`)
          .then((response) => response.json())
          .then((data) => {
            dispatch(setPosts(data.posts));
          });
        props.reloadFunction();
      });
  };

  //supprimer un post
  const handleDeletePost = () => {
    fetch(`https://concert-pal-backend.vercel.app/posts/${props._id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        dispatch(deletePost(props._id));
        props.reloadFunction();
      });
  };

  // ───── ⋆ ───── Naviguer vers le profile d'un autre user ───── ⋆ ─────
  const viewProfile = (author) => {
    author.token === token
      ? navigation.navigate('TabNavigator', { screen: 'Profile' })
      : navigation.navigate('UserProfileScreen', {
        username: author.username,
        userToken: author.token,
        userAvatar: author.avatar,
      });
  };

  // ───── ⋆ ───── Poster un commentaire ───── ⋆ ─────
  const handleSubmitComment = () => {
    if (!commentText) return

    fetch(
      `https://concert-pal-backend.vercel.app/comments/${token}/${props._id}`,
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

  //like un commentaire
  const handleLikeComment = (commentId) => {
    fetch(`https://concert-pal-backend.vercel.app/comments/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        _id: commentId,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetch(`https://concert-pal-backend.vercel.app/comments/post/${props._id}`)
          .then((response) => response.json())
          .then(() => {
            fetchComments();
          });
      });
  };

  //supprimer un commentaire
  const handleDeleteComment = (commentId) => {
    fetch(`https://concert-pal-backend.vercel.app/comments/${commentId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        fetchComments()
        props.reloadFunction()
      })
  }

  // ───── ⋆ ───── Fetch les commentaires ───── ⋆ ─────
  const fetchComments = () => [
    fetch(`https://concert-pal-backend.vercel.app/comments/post/${props._id}`)
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
    const isCommentLiked = comment.likes?.some((e) => e === token) || false;
    return (
      <View key={i} style={styles.commentContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <TouchableOpacity onPress={() => viewProfile(comment.author)}>
              <Image
                source={
                  !comment.author.avatar || comment.author.avatar === "default_avatar"
                    ? require('../assets/default_avatar.png')
                    : { uri: comment.author.avatar }
                }
                style={styles.userCommentAvatar}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => viewProfile(comment.author)}>
              <Text style={styles.username}>{comment.author.username}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <Text style={styles.postText}>{comment.text}</Text>
        <View style={styles.icons}>
          <TouchableOpacity>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => handleLikeComment(comment._id)}>
              <FontAwesome
                style={{
                  color: isCommentLiked ? '#F16364' : '#1D0322',
                  marginHorizontal: 20,
                }}
                name="heart"
                size={18}
              />
            </TouchableOpacity>
            <Text>{comment.likes.length}</Text>
          </View>
          {comment.author.token === token && (
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => handleDeleteComment(comment._id)}
            >
              <FontAwesome
                style={{ marginHorizontal: 20, color: '#565656' }}
                name="trash"
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>
      </View >
    );
  })

  return (
    <View style={styles.container}>
      {/*───── ⋆ ───── Profile Picture ───── ⋆ ─────*/}
      <View style={styles.profilePic}>
        <TouchableOpacity onPress={() => viewProfile(props.author)}>
          <Image
            source={
              !props.author.avatar || props.author.avatar === "default_avatar"
                ? require('../assets/default_avatar.png')
                : { uri: props.author.avatar }
            }
            style={styles.userAvatar}
          />
        </TouchableOpacity>
      </View>

      {/*───── ⋆ ───── Post Content ───── ⋆ ─────*/}
      <View style={styles.content}>
        {props.concert?.artist && (
          <TouchableOpacity style={styles.concertNameContainer} onPress={() => handleConcertNav()}>
            <Text style={styles.concertNameText}>{concertName}</Text>
          </TouchableOpacity>
        )}
        {/* ───── ⋆ ───── Username + Date ───── ⋆ ─────*/}
        <View style={styles.info}>
          <TouchableOpacity onPress={() => viewProfile(props.author)}>
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
          {props.author.token === token && (
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
          <View style={{ marginVertical: 10 }}>
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
    marginBottom: 7,
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
  },
  concertNameText: {
    color: 'grey',
    fontSize: 10
  },
  concertNameContainer: {
    marginBottom: 3,
    left: 10
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A5ECC0",
  },
  userCommentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A5ECC0",
    marginRight: 10,
  },
});