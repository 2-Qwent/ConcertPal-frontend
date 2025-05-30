import { ScrollView, StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useNavigation } from '@react-navigation/native';
import Post from '../components/Post';
import AddPostModal from '../components/AddPostModal';
import { LinearGradient } from 'expo-linear-gradient';


export default function ConcertScreen({ route }) {
  const user = useSelector((state) => state.user.value);
  const { artist, city, venue, seatmap, pic, date, concertId } = route.params;
  const formattedDate = moment(date).format("DD/MM/YYYY");
  const [modalVisible, setModalVisible] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [zone, setZone] = useState('');
  const [myZone, setMyZone] = useState(null);
  const [zoneUsers, setZoneUsers] = useState([]);
  const navigation = useNavigation();
  const [concertPosts, setConcertPosts] = useState([])
  const [reload, setReload] = useState(false); // Reload
  const [isVisible, setIsVisible] = useState(false); // Modal pour ajouter un post



  const handleAddPostModal = () => {
    setIsVisible(true);
  };

  const reloadFunction = () => {
    setReload(!reload);
  };

  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/getUserZone/${concertId}/${user.token}`)
      .then(res => res.json())
      .then(data => {
        if (data.result && data.zone) {
          setMyZone(data.zone);
        } else {
          setMyZone(null);
        }
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/getPosts/${concertId}`)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setConcertPosts(data.concertPosts)
        }
      })
  }, [concertId, reload]);

  const userPosts = concertPosts.map((data, i) => {
    const isLiked = data.likes?.some((post) => post === user.token) || false;
    return (
      <Post
        key={i}
        username={data.author?.username}
        text={data.text}
        date={moment(data.date).fromNow()}
        nbLikes={data.likes.length}
        nbComs={data.comments.length}
        isLiked={isLiked}
        reloadFunction={reloadFunction}
        artist={data.concert.artist}
        city={data.concert.city}
        {...data}
      />
    );
  });

  const handlePressMap = () => {
    setModalVisible(true);
  }

  const handleAddZone = () => {
    if (!zone.trim()) {
      alert("Merci de renseigner une zone !");
      return;
    }
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/addZone/${user.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zoneNumber: zone,
        concertId: concertId,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          alert("Zone ajoutée avec succès !");
          setModalVisible(false);
          setMyZone(zone);
          setZone('');
        } else {
          alert("Erreur lors de l'ajout de la zone");
        }
      })
  }

  const handleShowZoneUsers = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/getZoneUsers/${concertId}/${myZone}`)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setZoneUsers(data.users);
          setUsersModalVisible(true);
        } else {
          alert("Erreur lors de la récupération des utilisateurs");
        }
      });
  };

  const handleConcertUsers = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/concertUsers/${concertId}`)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setZoneUsers(data.users);
          setUsersModalVisible(true);
        } else {
          alert("Erreur lors de la récupération des utilisateurs du concert");
        }
      });
  };

  const viewProfile = (user) => {
    navigation.navigate('UserProfileScreen', {
      username: user.username,
      userToken: user.token,
      userAvatar: user.avatar,
    });
  };

  return (
    <ImageBackground
      source={require("../assets/IMG_background.png")}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.headContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10 }}
          >
            <FontAwesome name="chevron-left" size={24} color="#565656" />
          </TouchableOpacity>
          <Text style={styles.head}>
            {artist} - {venue} - {formattedDate}
          </Text>
        </View>

        {/* ───── ⋆ ───── Afficher ou non la seatmap ───── ⋆ ───── */}
        {seatmap !== "Pas de plan pour ce spectacle" ? (
          <TouchableOpacity
            style={styles.image}
            onPress={() => handlePressMap(seatmap)}
          >
            <Image style={styles.image} source={{ uri: seatmap }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.image}>
            <Text style={styles.noSeatmapText}>
              Pas de plan pour ce spectacle 😔
            </Text>
            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: '#A5ECC0', padding: 10, borderRadius: 8 }}
              onPress={handleConcertUsers}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voir les utilisateurs de ce concert</Text>
            </TouchableOpacity>
          </View>
        )}

        {myZone && (
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Ma zone : {myZone}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#A5ECC0",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={handleShowZoneUsers}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Voir les utilisateurs de ma zone
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Affiche l'input et le bouton d'ajout tant que la zone n'est pas renseignée */}
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalBackground}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <Image
                style={styles.fullscreenSeatmap}
                source={{ uri: seatmap }}
              />
              {!myZone && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Trouver mon siège..."
                    value={zone}
                    onChangeText={setZone}
                  />
                  <TouchableOpacity
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: "#A5ECC0",
                    }}
                    onPress={handleAddZone}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Ajouter ma zone
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={usersModalVisible}
          transparent={true}
          onRequestClose={() => setUsersModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalBackground}
              onPress={() => setUsersModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Utilisateurs dans la zone {myZone}</Text>
              {zoneUsers.length === 1 ? (
                <Text>Aucun autre utilisateur dans cette zone.</Text>
              ) : (
                zoneUsers
                  .filter((u) => u.token !== user.token)
                  .map((u, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => viewProfile(u)}>
                        <Image
                          source={
                            !u.avatar || u.avatar === "default_avatar"
                              ? require('../assets/default_avatar.png')
                              : { uri: u.avatar }
                          }
                          style={styles.userAvatar}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => viewProfile(u)}>
                        <Text key={i} style={{ fontWeight: "bold" }}>{u.username}</Text>
                      </TouchableOpacity>
                    </View>
                  ))
              )}
              <TouchableOpacity
                style={{ marginTop: 20, padding: 10, borderRadius: 8 }}
                onPress={() => setUsersModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <LinearGradient
          colors={["#A5ECC0", "#E2A5EC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { width: 340, height: 40 }]}
        >
          <TouchableOpacity
            style={styles.buttonAdd}
            onPress={() => handleAddPostModal()}
          >
            <Text style={{ color: "#565656" }}>Écrire un post...</Text>
          </TouchableOpacity>
        </LinearGradient>
        <AddPostModal
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          reloadFunction={reloadFunction}
          defaultConcertId={concertId}
        />
        <ScrollView style={styles.wrapper}>
          {userPosts.length === 0 ? (
            <Text style={styles.noPost}>
              Pas encore de posts à propos de ce concert. Soyez le premier !
            </Text>
          ) : (
            userPosts
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "95%",
    marginTop: 40,
    marginBottom: 20,
  },
  image: {
    width: "95%",
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  head: {
    textAlign: "center",
    textAlignVertical: "center",
    padding: 10,
    backgroundColor: "rgb(245, 245, 245)",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
  wrapper: {
    width: "90%",
    height: "60%",
    backgroundColor: "rgb(245, 245, 245)",
    borderRadius: 12,
    borderwidth: 2,
    borderColor: "#A5ECC0",
    marginBottom: 40,
  },
  postWrapper: {
    flexDirection: "row",
    padding: 20,
    borderBottomColor: "#A5ECC0",
    borderBottomWidth: 1,
  },
  profilePic: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  noSeatmapText: {
    fontSize: 16,
    color: "#565656",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(29, 3, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 5,
    elevation: 5,
    width: "95%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenSeatmap: {
    width: "100%",
    height: "90%",
    borderRadius: 8,
    resizeMode: "contain",
  },
  input: {
    width: 300,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "rgb(245, 245, 245)",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
  noPost: {
    fontSize: 20,
    color: "#565656",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "30%",
    marginHorizontal: 20,
    padding: 16,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: "center",
    margin: 10,
  },
  buttonAdd: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingLeft: 10,
    backgroundColor: "rgb(250, 250, 250)",
    borderRadius: 11,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#A5ECC0",
    marginRight: 10,
  },
});