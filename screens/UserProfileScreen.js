import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  SafeAreaView
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import Concert from "../components/Concert";
import Post from "../components/Post";
import { useDispatch, useSelector } from "react-redux";
import { newFollow, unfollow, setFollowers, setFollowing } from "../reducers/following";
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';


const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function UserProfileScreen({ route, navigation }) {
  const { username, userToken, userAvatar } = route.params; // données de l'utilisateur visité
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
    fetch(`https://concert-pal-backend.vercel.app/concerts/${userToken}`) // Récupération des concerts de l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setConcerts(data.list);
      });
    fetch(`https://concert-pal-backend.vercel.app/posts/${userToken}`) // Récupération des posts de l'utiilsateur visité
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
      });
    fetch(`https://concert-pal-backend.vercel.app/users/followers/${userToken}`) // Récupération des followers de l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setFollowersList(data.followers)
      })
    fetch(`https://concert-pal-backend.vercel.app/users/following/${userToken}`) // Récupération des utilisateurs suivis par l'utilisateur visité
      .then((response) => response.json())
      .then((data) => {
        setFollowingList(data.following);
      })
  }, [reload]);

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  // Navigation vers le profil de l'utilisateur
  const handleNavigate = (user) => {
    navigation.navigate('UserProfileScreen', {
      username: user.username,
      userToken: user.token,
      userAvatar: user.avatar,
    });
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
        id={data._id}
        screen="UserProfile"
      />
    );
  });

  // ───── ⋆ ───── Liste des posts de l'utilisateur ───── ⋆ ─────
  const userPosts = posts.map((data, i) => {
    const isLiked = data.likes.some((data) => data === token);
    return (
      <Post
        key={i}
        username={data.author.username}
        text={data.text}
        date={data.date}
        nbLikes={data.likes.length}
        isLiked={isLiked}
        reloadFunction={reloadFunction}
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
      avatar: userAvatar,
    });
  };

  // ───── ⋆ ───── Suivre l'utilisateur visité ───── ⋆ ─────
  const followUser = () => {
    fetch(`https://concert-pal-backend.vercel.app/users/follow/${token}`, {
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
    fetch(`https://concert-pal-backend.vercel.app/users/unfollow/${token}`, {
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
  const followersDispay = followersList.map((user, i) => {
    return (
      <View key={i} style={styles.modalItem}>
        <TouchableOpacity onPress={() => handleNavigate(user)}>
          <Image
            source={
              !user.avatar || user.avatar === "default_avatar"
                ? require('../assets/default_avatar.png')
                : { uri: user.avatar }
            }
            style={styles.userFollowAvatar}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate(user)}>
          <Text style={{ fontWeight: "bold" }}>{user.username}</Text>
        </TouchableOpacity>
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
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFollowersModal(false)}
            >
              <FontAwesome name="times" size={24} color="#565656" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {followersDispay}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ───── ⋆ ───── Affichage des utilisateurs suivis par l'utilisateur visité ───── ⋆ ─────
  const followingDispay = followingList.map((user, i) => {
    return (
      <View
        key={i}
        style={styles.modalItem}
      >
        <TouchableOpacity onPress={() => handleNavigate(user)}>
          <Image
            source={
              !user.avatar || user.avatar === "default_avatar"
                ? require('../assets/default_avatar.png')
                : { uri: user.avatar }
            }
            style={styles.userFollowAvatar}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate(user)}>
          <Text style={{ fontWeight: "bold" }}>{user.username}</Text>
        </TouchableOpacity>
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
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFollowingModal(false)}
            >
              <FontAwesome name="times" size={24} color="#565656" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {followingDispay}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
        {/* ───── ⋆ ───── Top ───── ⋆ ───── */}
        <View style={styles.aboutUser}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 20 }}>
              <FontAwesome name="chevron-left" size={24} color="#565656" />
            </TouchableOpacity>
            <Image
              source={
                !userAvatar || userAvatar === 'default_avatar'
                  ? require('../assets/default_avatar.png')
                  : { uri: userAvatar }
              }
              style={styles.userAvatar}
            />
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.profileText}>
                <Text style={styles.userName}>{username}</Text>
                <LinearGradient
                  colors={['#A5ECC0', '#E2A5EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: 200, height: 30 }]}>
                  {followButton}
                </LinearGradient>
                {unfollowModalContent}
                <LinearGradient
                  colors={['#A5ECC0', '#E2A5EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: 200, height: 30 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      goToChat(userToken);
                    }}
                    style={styles.button}>
                    <Text>Envoyer un message</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.followContent}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setFollowingModal(true)}>
            <Text style={styles.followText}>
              {followingList.length} abonnements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setFollowersModal(true)}>
            <Text style={styles.followText}>
              {followersList.length} abonnés
            </Text>
          </TouchableOpacity>
          {followersModalContent}
          {followingModalContent}
        </View>
        {/* ───── ⋆ ───── Content ───── ⋆ ───── */}
        <View style={styles.contentContainer}>
          {/* ───── ⋆ ───── Tabs ───── ⋆ ───── */}
          <View style={styles.tabContainer}>
            {['concerts', 'posts', 'media'].map((tab, i) => (
              <TouchableOpacity key={i} onPress={() => handleTabPress(tab)}>
                {activeTab === tab ? (
                  <LinearGradient
                    colors={['rgb(165, 167, 236)', 'rgb(245, 245, 245)']}
                    style={styles.tab}>
                    <Text style={{ color: '#565656' }}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tab}>
                    <Text style={{ color: 'rgb(120, 122, 197)' }}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* ───── ⋆ ───── Tab Content ───── ⋆ ───── */}
          <View style={styles.tabContent}>
            {activeTab === "concerts" &&
              (userConcerts.length > 0 ? (
                <ScrollView
                  style={{
                    maxHeight: "90%",
                    width: "100%",
                    borderRadius: 12,
                  }}
                >
                  {userConcerts}
                </ScrollView>
              ) : (
                <Text style={styles.emptyTabText}>
                  Cet utilisateur n'a pas ajouté de concert à sa liste.
                </Text>
              ))}
            {activeTab === "posts" &&
              (userPosts.length > 0 ? (
                <ScrollView
                  style={{
                    maxHeight: '90%',
                    width: '100%',
                    borderRadius: 12,
                  }}
                >{userPosts}</ScrollView>
              ) : (
                <Text style={styles.emptyTabText}>
                  Cet utilisateur n'a pas créé de post.
                </Text>
              ))}
            {activeTab === "media" && (
              <View style={styles.mediaContainer}>{media}</View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 75,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutUser: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilePic: {
    marginTop: 20,
    width: "40%",
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    left: 10,
  },
  profileText: {
    width: "60%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
    right: 10,
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
    borderRadius: 11,
  },
  contentContainer: {
    backgroundColor: 'rgb(245, 245, 245)',
    width: '95%',
    height: '77%',
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
    width: 100,
    height: 50,
    color: 'rgb(245, 245, 245)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    height: 40,
  },
  followText: {
    color: 'rgb(120, 122, 197)',
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  tabContent: {
    paddingBottom: 5,
    height: '94%',
  },
  userFollowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A5ECC0",
    marginRight: 10,
  },
  userAvatar: {
    width: 85,
    height: 85,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A5ECC0",
    marginRight: 10,
    marginLeft: -20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    width: '100%',
  },
  emptyTabText: {
    textAlign: "center",
    marginTop: 20,
    color: "#565656",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  }
});