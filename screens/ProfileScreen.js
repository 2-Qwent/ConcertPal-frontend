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
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Concert from "../components/Concert";
import EditProfileModal from "../components/EditProfileModal";
import { logout } from "../reducers/user";
import { setConcerts } from "../reducers/concerts";
import Post from "../components/Post";
import AddPostModal from "../components/AddPostModal";
import { LinearGradient } from 'expo-linear-gradient';
import { setFollowing, setFollowers } from "../reducers/following";
import Icon from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from '@react-navigation/native';

import { addPost } from "../reducers/post";
import * as ImagePicker from 'expo-image-picker';

const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("concerts"); // Onglet actif
  const [activeUser, setActiveUser] = useState([]); // Utilisateur actif
  const [reload, setReload] = useState(false); // Pour recharger les données
  const [isVisible, setIsVisible] = useState(false) // Pour afficher la modal d'ajout de post
  const following = useSelector((state) => state.following.value); // Données du reducer following
  const followingList = following.following; // Liste des utilisateurs suivis
  const [followingModal, setFollowingModal] = useState(false); // Pour afficher la modal des utilisateurs suivis
  const [followersModal, setFollowersModal] = useState(false); // Pour afficher la modal des utilisateurs suivis
  const followersList = following.followers; // Liste des followers de l'utilisateur
  const isFocused = useIsFocused();

  // Posts de l'utilisateur uniquement
  const [postContent, setPostContent] = useState('')
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Séléction des concerts et posts :
  const concerts = useSelector((state) => state.concerts.value) || [];
  const posts = useSelector((state) => state.post.value) || [];
  const user = useSelector((state) => state.user.value);
  const token = user.token; // Token de l'utilisateur connecté

  const filteredPosts = posts.filter((post) => post.author.token === token)

  const reloadFunction = () => {
    setReload(!reload)
  }

  const dispatch = useDispatch()

  const reloadFunction2 = async () => {
    try {
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/user/${user.token}`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        setActiveUser(data.user); // Met à jour l'utilisateur actif avec les nouvelles données
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du profil:', error);
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  // bouton déconnexion
  const handleLogoutPress = () => {
    dispatch(logout())
    persistor.purge();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  const handleNavigate = (user) => {
    navigation.navigate('UserProfileScreen', {
      username: user.username,
      userToken: user.token,
      userAvatar: user.avatar,
    });
  };


  useEffect(() => {
    if (!isFocused) return;
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
  }, [reload, isFocused]);

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
        date={moment(data.date).fromNow()}
        nbLikes={data.likes.length}
        nbComs={data.comments.length}
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
        }}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setFollowingModal(false)}
        />
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalList}>{followingDisplay}</ScrollView>
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

  // ───── ⋆ ───── Affichage des followers de l'utilisateur ───── ⋆ ─────
  const followersDisplay = followersList.map((user, i) => {
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
          <ScrollView style={styles.modalList}>{followersDisplay}</ScrollView>
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

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
        {/* ───── ⋆ ───── Top ───── ⋆ ───── */}
        <View style={styles.aboutUser}>
          <View style={styles.profilePic}>
            <Image
              source={
                !activeUser.avatar || activeUser.avatar === "default_avatar"
                  ? require('../assets/default_avatar.png')
                  : { uri: activeUser.avatar }
              }
              style={styles.userAvatar}
            />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{activeUser.username}</Text>
            <LinearGradient
              colors={['#A5ECC0', '#E2A5EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: 200, height: 30 }]}>
              <TouchableOpacity style={styles.button}>
                <Text
                  style={{ color: '#565656' }}
                  onPress={() => setIsEditModalVisible(true)}>
                  Modifier mon profil
                </Text>
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

            <EditProfileModal
              isVisible={isEditModalVisible}
              setIsVisible={setIsEditModalVisible}
              user={activeUser}
              reloadFunction={reloadFunction2}
            />
          </View>
        </View>
        <View style={styles.followContent}>
          <TouchableOpacity
            onPress={() => setFollowingModal(true)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.followText}>
              {followingList.length} abonnements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFollowersModal(true)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.followText}>
              {followersList.length} abonnés
            </Text>
          </TouchableOpacity>
          {followingModalContent}
          {followersModalContent}
        </View>
        {/* ───── ⋆ ───── Add post ───── ⋆ ───── */}
        <LinearGradient
          colors={['#A5ECC0', '#E2A5EC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { width: 340, height: 40 }]}>
          <TouchableOpacity
            style={styles.button}
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
            {activeTab === 'concerts' && (
              <ScrollView
                style={{
                  maxHeight: '88%',
                  width: '100%',
                  borderRadius: 12,
                }}>
                {userConcerts}
              </ScrollView>
            )}
            {activeTab === 'posts' && (
              <ScrollView
                style={{
                  maxHeight: '88%',
                  width: '100%',
                  borderRadius: 12,
                }}>
                {userPosts}
              </ScrollView>
            )}
            <ScrollView
              style={{
                maxHeight: '88%',
                width: '100%',
                borderRadius: 12,
              }}>
              <View style={styles.mediaContainer}>
                {activeTab === 'media' && media}
              </View>
            </ScrollView>
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
    width: '40%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#A5ECC0',
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
  chevron: {
    height: 30,
    bottom: 20,
  },
  userFollowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5ECC0',
    marginRight: 10,
  },
});
