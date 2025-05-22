import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  ScrollView,
  TextInput,
  Modal
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Concert from "../components/Concert";
import { logout } from "../reducers/user";
import { setConcerts } from "../reducers/concerts";
import Post from "../components/Post";
import moment from "moment";
import { addPost } from "../reducers/post";


const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("concerts");

  const [activeUser, setActiveUser] = useState([]);
  const user = useSelector((state) => state.user.value);
  const concerts = useSelector((state) => state.concerts.value);
  const [ reload , setReload ] = useState(false);
  const posts = useSelector((state) => state.post.value)
  const [isVisible, setIsVisible] = useState(false)
  const [postContent, setPostContent] = useState('')



  const reloadFunction = () => {
    setReload(!reload)
  }

  const token = user.token;
  const dispatch = useDispatch()



  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/${token}`)
      .then((response) => response.json())
      .then((data) => {
        setActiveUser(data.user);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/${token}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setConcerts(data.list));
      });
  }, [reload]);

  const handleTabPress = (tabName) => {
    // console.log('I was clicked UwU');
    setActiveTab(tabName);
  };

  const handleLogoutPress = () => {
    dispatch(logout())
    navigation.navigate('Login')
  }

  const userConcerts = concerts.map((data, i) => {
    return (
      <Concert
        key={i}
        pic={data.pic}
        city={data.city}
        venue={data.venue}
        artist={data.artist}
        date={data.date}
        seatmap={data.seatmap}
        screen="Profile"
        id={data.id}
      />
    );
  });

  //liste des posts de l'utilisateur
  const userPosts = posts.map((data, i) => {
    const isLiked = data.likes.some((post) => post === token);
    return (
      <Post
        key={i}
        username={data.author.username}
        text={data.text}
        date={moment(data.date).fromNow()}
        nbLikes={data.likes.length}
        isLiked={isLiked}
        reloadFunction={reloadFunction}
        {...data}
      />
    );
  });

  const media = mediaData.map((data, i) => {
    return (
      <View key={i}>
        <Image source={data} style={styles.image} resizeMode="cover" />
      </View>
    );
  });

  //affichage modal pour ajouter un post
  const handleAddPostModal = () => {
    setIsVisible(true)
  }

  //créer un post
  const newPost = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({text: postContent}),
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(addPost(data.post))
        setPostContent('')
        setIsVisible(false)
      });
  };

  //modal pour ajouter un post
  const addPostModalContent = (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TextInput
          placeholder="Ajouter un post"
          value={postContent}
          onChangeText={setPostContent}
        />
        <TouchableOpacity onPress={() => newPost()}>
          <Text>Poster</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsVisible(false)} >
          <Text>Annuler</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require("../assets/IMG_background.png")}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* ───── ⋆ ───── Top ───── ⋆ ───── */}
        <View style={styles.aboutUser}>
          <View style={styles.profilePic}>
            <FontAwesome name="user-circle" size={80} color="#000000" />
            <Text>placeholder</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{activeUser.username}</Text>
            <TouchableOpacity style={styles.button}>
              <Text>Modifier mon profil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLogoutPress()} style={styles.button}>
              <Text>Me déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* ───── ⋆ ───── Content ───── ⋆ ───── */}
        <TouchableOpacity onPress={() => handleAddPostModal()}>
          <Text>Add post</Text>
        </TouchableOpacity>
        {isVisible && addPostModalContent}
        <View style={styles.contentContainer}>
          {/* ───── ⋆ ───── Tabs ───── ⋆ ───── */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => handleTabPress("concerts")}
              style={styles.tab}
            >
              <Text>Concerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress("posts")}
              style={styles.tab}
            >
              <Text>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress("media")}
              style={styles.tab}
            >
              <Text>Media</Text>
            </TouchableOpacity>
          </View>
          {/* ───── ⋆ ───── Tab Content ───── ⋆ ───── */}
          <View style={styles.tabContent}>
            {activeTab === "concerts" && (
              <ScrollView>{userConcerts}</ScrollView>
            )}
            {activeTab === "posts" && (
              <ScrollView>{userPosts}</ScrollView>
            )}
            <View style={styles.mediaContainer}>
              {activeTab === "media" && media}
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  aboutUser: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profilePic: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    width: "60%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 20,
  },
  userName: {
    fontSize: 36,
  },
  button: {
    width: 200,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#E8EAED",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: "#E8EAED",
    width: "95%",
    height: "500",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7D7D7",
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
    paddingBottom: 15,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#D7D7D7",
  },
  tab: {
    width: 80,
    height: 50,
    color: "#E8EAED",
    backgroundColor: "#A5A7EC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  concert: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#D7D7D7",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15,
  },
  concertContainerTop: {
    width: "100%",
    // backgroundColor: 'aqua',
    height: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: 140,
    height: 140,
    margin: 10,
    borderRadius: 12,
  },
  mediaContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    height: 200,
    position: "absolute",
  },
});
