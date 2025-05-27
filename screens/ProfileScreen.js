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
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Concert from "../components/Concert";
import { logout } from "../reducers/user";
import { setConcerts } from "../reducers/concerts";
import Post from "../components/Post";
import AddPostModal from "../components/AddPostModal";
import { LinearGradient } from 'expo-linear-gradient';
import { setFollowing, setFollowers } from "../reducers/following";


const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("concerts"); // Onglet actif
  const [activeUser, setActiveUser] = useState([]); // Utilisateur actif
  const user = useSelector((state) => state.user.value); // Données du reducer utilisateur
  const concerts = useSelector((state) => state.concerts.value); // Données du reducer concerts
  const [reload, setReload] = useState(false); // Pour recharger les données
  const posts = useSelector((state) => state.post.value) // Données du reducer posts
  const [isVisible, setIsVisible] = useState(false) // Pour afficher la modal d'ajout de post
  const token = user.token; // Token de l'utilisateur connecté
  const following = useSelector((state) => state.following.value); // Données du reducer following
  const followingList = following.following; // Liste des utilisateurs suivis
  const [followingModal, setFollowingModal] = useState(false); // Pour afficher la modal des utilisateurs suivis
  const [followersModal, setFollowersModal] = useState(false); // Pour afficher la modal des utilisateurs suivis
  const followersList = following.followers; // Liste des followers de l'utilisateur

  // Posts de l'utilisateur uniquement
  const filteredPosts = posts.filter((post) => post.author.token === token)

  const reloadFunction = () => {
    setReload(!reload)
  }

  const dispatch = useDispatch()


  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/${token}`) // Récupération des données de l'utilisateur
      .then((response) => response.json())
      .then((data) => {
        setActiveUser(data.user);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/${token}`) // Récupération des concerts de l'utilisateur
      .then((response) => response.json())
      .then((data) => {
        // On mappe pour renommer _id en id
        const concertsWithId = data.list.map(concert => ({
          ...concert,
          id: concert._id,
        }));
        dispatch(setConcerts(concertsWithId));
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/following/${token}`) // Récupération des utilisateurs suivis
      .then((response) => response.json())
      .then((data) => {
        dispatch(setFollowing(data.following));
      })
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/followers/${token}`) // Récupérer la liste des followers
      .then((response) => response.json())
      .then((data) => {
        dispatch(setFollowers(data.followers));
      })
  }, [reload]);

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogoutPress = () => {
    dispatch(logout())
    navigation.navigate('Login')
  }

  // Liste des concerts de l'utilisateur
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

  //Liste des posts de l'utilisateur
  const userPosts = filteredPosts.map((data, i) => {
    const isLiked = data.likes.some((post) => post === token);
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

  // Liste des médias de l'utilisateur
  const media = mediaData.map((data, i) => {
    return (
      <View key={i}>
        <Image source={data} style={styles.image} resizeMode="cover" />
      </View>
    );
  });

  //Affichage de la modal pour ajouter un post
  const handleAddPostModal = () => {
    setIsVisible(true)
  }

  // ───── ⋆ ───── Affichage des utilisateurs suivis par l'utilisateur ───── ⋆ ─────
  const followingDisplay = followingList.map((user, i) => {
    return (
      <View
      key={i}
      style={{ padding: 10, borderBottomWidth: 1, borderColor: "#D7D7D7" }}
      >
        <Text>{user.username}</Text>
        <Text>{user.avatar}</Text>
      </View>
    )
  })

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
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          onPress={() => setFollowingModal(false)}
        />
        <View style={styles.modalContainer}>{followingDisplay}</View>
        <TouchableOpacity
          onPress={() => setFollowingModal(false)}
          style={styles.button}
        >
          <Text>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  // ───── ⋆ ───── Affichage des followers de l'utilisateur ───── ⋆ ─────
  const followersDisplay = followersList.map((user, i) => {
    return (
      <View
      key={i}
      style={{ padding: 10, borderBottomWidth: 1, borderColor: "#D7D7D7" }}
      >
        <Text>{user.username}</Text>
        <Text>{user.avatar}</Text>
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
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          onPress={() => setFollowersModal(false)}
        />
        <View style={styles.modalContainer}>{followersDisplay}</View>
        <TouchableOpacity
          onPress={() => setFollowersModal(false)}
          style={styles.button}
        >
          <Text>Fermer</Text>
        </TouchableOpacity>
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
            <Text style={styles.userName}>{activeUser.username}</Text>
            <LinearGradient
              colors={['#A5ECC0', '#E2A5EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: 200, height: 30 }]}>
              <TouchableOpacity style={styles.button}>
                <Text style={{ color: '#565656' }}>Modifier mon profil</Text>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
              colors={['#A5ECC0', '#E2A5EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: 200, height: 30 }]}>
              <TouchableOpacity
                onPress={() => handleLogoutPress()}
                style={styles.button}>
                <Text style={{ color: '#565656' }}>Me déconnecter</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
        {/* ───── ⋆ ───── Add post ───── ⋆ ───── */}
        <LinearGradient
          colors={['#A5ECC0', '#E2A5EC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { width: 340, height: 40 }]}>
          <TouchableOpacity
            style={styles.buttonAdd}
            onPress={() => handleAddPostModal()}>
            <Text style={{ color: '#565656' }}>Type...</Text>
          </TouchableOpacity>
        </LinearGradient>
        <AddPostModal
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          reloadFunction={reloadFunction}
        />
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
              <ScrollView style={{
              maxHeight: '90%',
              width: '100%',
              borderRadius: 12,
            }}>{userConcerts}</ScrollView>
            )}
            {activeTab === 'posts' && <ScrollView>{userPosts}</ScrollView>}
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
    paddingVertical: 20, 
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
  buttonAdd: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    backgroundColor: 'rgb(250, 250, 250)',
    borderRadius: 11,
  },
  contentContainer: {
    backgroundColor: 'rgb(245, 245, 245)',
    width: '95%',
    height: '65%',
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
    modalContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 200,
  },
    modalContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 200,
  },
});
