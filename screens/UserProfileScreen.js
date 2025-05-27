import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Image, ScrollView, Modal } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import Concert from "../components/Concert";
import Post from "../components/Post";
import { useDispatch, useSelector } from "react-redux";
import { newFollow, unfollow, setFollowers, setFollowing } from "../reducers/following";

const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function UserProfileScreen({ route, navigation }) {
  const { username, userToken } = route.params;
  const [activeTab, setActiveTab] = useState('concerts');
  const [concerts, setConcerts] = useState([])
  const [posts, setPosts] = useState([])
  const user = useSelector((state) => state.user.value);
  const token = user.token; // token de l'utilisateur connecté
  const [reload, setReload] = useState(false);
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false); //modal pour confirmation de désabonnement
  const [followingList, setFollowingList] = useState([]); // liste des utilisateurs suivis
  const following = useSelector((state) => state.following.value.following) || [];
  const followers = useSelector((state) => state.following.value.followers) || []

  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/${userToken}`)
      .then((response) => response.json())
      .then((data) => {
        setConcerts(data.list);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${userToken}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/following/${token}`) //récupérer la liste des utilisateurs suivis
      .then(response => response.json())
      .then(data => {
        dispatch(setFollowing(data.following));
      })
  }, [reload]);

  const handleTabPress = (tabName) => {
    // console.log('I was clicked UwU');
    setActiveTab(tabName);
  };

  // ───── ⋆ ───── Liste des concerts de l'utilisateur ───── ⋆ ─────
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
          id={data.id}
          screen="UserProfile"
        />
      );
    });

  // ───── ⋆ ───── Liste des posts de l'utilisateur ───── ⋆ ─────
  const userPosts = posts.map((data, i) => {
      // const isLiked = data.likes.some((data) => data === myToken);
      return (
        <Post
          key={i}
          username={data.author.username}
          text={data.text}
          date={data.date}
          nbLikes={data.likes.length}
          // isLiked={isLiked}
          // reloadFunction={reloadFunction}
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

  const goToChat = () => {
    console.log('navigate to chat with : ', username);
    navigation.navigate('ChatScreen', {
      sender: username,
      token: userToken,
    });
  };

  const followUser = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/follow/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendToken: userToken }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(newFollow({
            token: data.friend.token,
            username: data.friend.username,
            avatar: data.friend.avatar,
          }));
        }
      });
  };

  const unfollowUser = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/unfollow/${token}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendToken: userToken }),
    }).then((response) => response.json())
      .then(data => {
        if (data.result) {
          dispatch(unfollow({token: data.friend.token}))
          setModalVisible(false);
        }
      })
  }

  let followButton = (
    <TouchableOpacity onPress={followUser} style={styles.button}>
      <Text>Suivre</Text>
    </TouchableOpacity>
  );

  const isFollowing = following.some(e => e.token === userToken);

  if (isFollowing) {
    followButton = (
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Text>Abonné</Text>
      </TouchableOpacity>
    )
  }

  const nbFollowing = following.length;

  const unfollowModalContent = (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    }}>
        <View style={styles.modalContainer}>
          <Text>Etes vous sûr de vouloir vous désabonner de {username} ?</Text>
          <TouchableOpacity onPress={unfollowUser}>
            <Text>Oui</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        {/* ───── ⋆ ───── Top ───── ⋆ ───── */}
        <View style={styles.aboutUser}>
          <View style={styles.profilePic}>
            <FontAwesome name="user-circle" size={80} color="#000000" />
            <Text>placeholder</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{username}</Text>
            {followButton}
            {unfollowModalContent}
            <Text>{nbFollowing}</Text>
            <TouchableOpacity onPress={()=>{goToChat(userToken)}} style={styles.button}>
              <Text>Envoyer un message</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* ───── ⋆ ───── Content ───── ⋆ ───── */}
        <View style={styles.contentContainer}>
          {/* ───── ⋆ ───── Tabs ───── ⋆ ───── */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => handleTabPress('concerts')}
              style={styles.tab}>
              <Text>Concerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress('posts')}
              style={styles.tab}>
              <Text>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress('media')}
              style={styles.tab}>
              <Text>Media</Text>
            </TouchableOpacity>
          </View>
          {/* ───── ⋆ ───── Tab Content ───── ⋆ ───── */}
          <View style={styles.tabContent}>
            {activeTab === 'concerts' && (
              <ScrollView>{userConcerts}</ScrollView>
            )}
            {activeTab === 'posts' && (
              <ScrollView>
                {userPosts}
              </ScrollView>
            )}
            <View style={styles.mediaContainer}>
              {activeTab === 'media' && media}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  aboutUser: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profilePic: {
    width: '40%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    width: '60%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
  },
  userName: {
    fontSize: 36,
  },
  button: {
    width: 200,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#E8EAED',
    borderWidth: 2,
    borderColor: '#A5ECC0',
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: '#E8EAED',
    width: '95%',
    height: '500',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7D7D7',
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
    paddingBottom: 15,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
  },
  tab: {
    width: 80,
    height: 50,
    color: '#E8EAED',
    backgroundColor: '#A5A7EC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  concert: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
  },
  concertContainerTop: {
    width: '100%',
    // backgroundColor: 'aqua',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    margin: 10,
    borderRadius: 12,
  },
  mediaContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 200,
  },
});