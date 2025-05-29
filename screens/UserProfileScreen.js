import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Image, ScrollView, Modal, Pressable } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import Concert from "../components/Concert";
import Post from "../components/Post";
import { useDispatch, useSelector } from "react-redux";
import { newFollow, unfollow, setFollowers, setFollowing } from "../reducers/following";
import { LinearGradient } from 'expo-linear-gradient';

const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function UserProfileScreen({ route, navigation }) {
  const { username, userToken } = route.params; // données de l'utilisateur visité
  const [activeTab, setActiveTab] = useState('concerts'); // onglet actif
  const [concerts, setConcerts] = useState([]) // liste des concerts de l'utilisateur
  const [posts, setPosts] = useState([]) // liste des posts de l'utilisateur
  const user = useSelector((state) => state.user.value); // données du reducer utilisateur
  const token = user.token; // token de l'utilisateur connecté
  const [reload, setReload] = useState(false); // pour recharger les données
  const dispatch = useDispatch();
  const [unfollowModalVisible, setUnfollowModalVisible] = useState(false); //modal pour confirmation de désabonnement
  const [followersList, setFollowersList] = useState([]); // liste des followers la personne visitée
  const following = useSelector((state) => state.following.value); // données du reducer following
  const myFollowing = following.following; // liste des utilisateurs suivis par l'utilisateur connecté
  const [followersModal, setFollowersModal] = useState(false); // modal pour afficher les followers de la personne visitée
  const [followingList, setFollowingList] = useState([]); // liste des utilisateurs suivis par la personne visitée
  const [followingModal, setFollowingModal] = useState(false); // modal pour afficher les utilisateurs suivis par la personne visitée


  const reloadFunction = () => {
    setReload(!reload)
  }


  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/${userToken}`) // Récupération des concerts de l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setConcerts(data.list);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${userToken}`) // Récupération des posts de l'utiilsateur visité
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/followers/${userToken}`) // Récupération des followers de l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setFollowersList(data.followers)
      })
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/following/${userToken}`) // Récupération des utilisateurs suivis par l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setFollowingList(data.following);
      })
  }, [reload]);

  const handleTabPress = (tabName) => {
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

  // ───── ⋆ ───── Liste des médias de l'utilisateur ───── ⋆ ─────
  const media = mediaData.map((data, i) => {
    return (
      <View key={i}>
        <Image source={data} style={styles.image} resizeMode="cover" />
      </View>
    );
  });

  const goToChat = () => {
    navigation.navigate('ChatScreen', {
      sender: username,
      token: userToken,
    });
  };

  // ───── ⋆ ───── Suivre l'utilisateur visité ───── ⋆ ─────
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
        reloadFunction();
      });
  };

  // ───── ⋆ ───── Se désabonner de l'utilisateur visité ───── ⋆ ─────
  const unfollowUser = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/unfollow/${token}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendToken: userToken }),
    }).then((response) => response.json())
      .then(data => {
        if (data.result) {
          dispatch(unfollow({ token: data.friend.token }))
          setUnfollowModalVisible(false);
        }
        reloadFunction();
      })
  }

  // ───── ⋆ ───── Bouton de suivi ───── ⋆ ─────
  let followButton = (
    <TouchableOpacity onPress={followUser} style={styles.button}>
      <Text>Suivre</Text>
    </TouchableOpacity>
  );

  const isFollowing = myFollowing.some(e => e.token === userToken);

  if (isFollowing) {
    followButton = (
      <TouchableOpacity onPress={() => setUnfollowModalVisible(true)} style={styles.button}>
        <Text>Abonné</Text>
      </TouchableOpacity>
    )
  }

  // ───── ⋆ ───── Modal de confirmation de désabonnement ───── ⋆ ─────
  const unfollowModalContent = (
    <Modal
      visible={unfollowModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setUnfollowModalVisible(false)}
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
          <TouchableOpacity onPress={() => setUnfollowModalVisible(false)}>
            <Text>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ───── ⋆ ───── Affichage des followers de l'utilisateur visité ───── ⋆ ─────
  const followersDispay = followersList.map((follower, i) => {
    return (
      <View key={i} style={{ padding: 10, borderBottomWidth: 1, borderColor: '#D7D7D7' }}>
        <Text>{follower.username}</Text>
        <Text>{follower.avatar}</Text>
      </View>
    )
  })

  const followersModalContent = (
    <Modal
      visible={followersModal}
      transparent
      animationType="fade"
      onRequestClose={() => setFollowersModal(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setFollowersModal(false)}
        />
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalList}>
            {followersDispay}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setFollowersModal(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ───── ⋆ ───── Affichage des utilisateurs suivis par l'utilisateur visité ───── ⋆ ─────
  const followingDispay = followingList.map((follower, i) => {
    return (
      <View
        key={i}
        style={{ padding: 10, borderBottomWidth: 1, borderColor: "#D7D7D7" }}
      >
        <Text>{follower.username}</Text>
        <Text>{follower.avatar}</Text>
      </View>
    );
  });

  const followingModalContent = (
    <Modal
      visible={followingModal}
      transparent
      animationType="fade"
      onRequestClose={() => setFollowingModal(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setFollowingModal(false)}
        />
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalList}>
            {followingDispay}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setFollowingModal(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
            <FontAwesome name="chevron-left" size={24} color="#565656" />
          </TouchableOpacity>
          <View style={styles.profilePic}>
            <FontAwesome name="user-circle" size={80} color="#000000" />
            <Text>placeholder</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{username}</Text>
            <LinearGradient
              colors={["#A5ECC0", "#E2A5EC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: 200, height: 30 }]}
            >
              {followButton}
            </LinearGradient>
            {unfollowModalContent}
            <LinearGradient
              colors={["#A5ECC0", "#E2A5EC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: 200, height: 30 }]}
            >
              <TouchableOpacity
                onPress={() => {
                  goToChat(userToken);
                }}
                style={styles.button}
              >
                <Text>Envoyer un message</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.followContent}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setFollowingModal(true)}
          >
            <Text style={styles.followText}>{followingList.length} abonnements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setFollowersModal(true)}
          >
            <Text style={styles.followText}>{followersList.length} abonnés</Text>
          </TouchableOpacity>
          {followersModalContent}
          {followingModalContent}
        </View>
        {/* ───── ⋆ ───── Content ───── ⋆ ───── */}
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
              <ScrollView
                style={{
                  maxHeight: "92%",
                  width: "100%",
                  borderRadius: 12,
                }}
              >
                {userConcerts}
              </ScrollView>
            )}
            {activeTab === "posts" && <ScrollView>{userPosts}</ScrollView>}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  aboutUser: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilePic: {
    width: '40%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    width: '60%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  userName: {
    fontSize: 36,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: 'center',
    margin: 10,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: 'rgb(245, 245, 245)',
    width: '95%',
    height: '75%',
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
    color: 'rgb(245, 245, 245)',
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
  followContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    height: 50,
  },
  followText: {
    textAlign: 'center',
    fontSize: 16,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '85%',
    maxHeight: 350,
    borderRadius: 16,
    padding: 20,
    zIndex: 2,
  },
  modalList: {
    width: '100%',
    marginBottom: 16,
  },
  modalItem: {
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
    alignItems: 'center',
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#A5ECC0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalCloseText: {
    color: '#565656',
    fontWeight: 'bold',
    fontSize: 16,
  },
});