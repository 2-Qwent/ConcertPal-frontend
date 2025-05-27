import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useNavigation } from '@react-navigation/native';

const postsData = [
  {
    author: "John Doe",
    date: "20/05/2025",
    postBody: "Good concert",
  },
  {
    author: "Jane Doe",
    date: "20/05/2025",
    postBody: "Cannot wait to meet again",
  },
  {
    author: "Lauren",
    date: "20/05/2025",
    postBody: "I loved the show!",
  },
];

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

  useEffect(() => {
    console.log("route", route.params)
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/getUserZone/${concertId}/${user.token}`)
      .then(res => res.json())
      .then(data => {
        if (data.result && data.zone) {
          setMyZone(data.zone);
        } else {
          setMyZone(null);
        }
      });
  }, [concertId]);

  const userPosts = postsData.map((data, i) => {
    return (
      <View style={styles.postWrapper} key={i}>
        <View style={styles.profilePic}>
          <FontAwesome name="user-circle" size={45} color="#000000" />
          <Text style={{ fontSize: 7, color: 'rgba(0,0,0,0.5)' }}>
            placeholder profile pic
          </Text>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '85%',
            }}>
            <Text>{data.author}</Text>
            <Text>{data.date}</Text>
          </View>
          <Text>{data.postBody}</Text>
        </View>
      </View>
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

  const viewProfile = (user) => {
    setUsersModalVisible(false);
    navigation.navigate('UserProfileScreen', {
      username: user.username,
      userToken: user.token,
    });
  };

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.head}>
          {artist} - {venue} - {formattedDate}
        </Text>

        {/* ───── ⋆ ───── Afficher ou non la seatmap ───── ⋆ ───── */}
        {seatmap !== 'Pas de plan pour ce spectacle' ? (
          <TouchableOpacity
            style={styles.image}
            onPress={() => handlePressMap(seatmap)}>
            <Image style={styles.image} source={{ uri: seatmap }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.image}>
            <Text style={styles.noSeatmapText}>
              Pas de plan pour ce spectacle 😔
            </Text>
          </View>
        )}

        {myZone ? (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Ma zone : {myZone}</Text>
            <TouchableOpacity
              style={{ marginTop: 10, backgroundColor: '#A5ECC0', padding: 10, borderRadius: 8 }}
              onPress={handleShowZoneUsers}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voir les utilisateurs de ma zone</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Affiche l'input et le bouton d'ajout tant que la zone n'est pas renseignée
          <Modal
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}>
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
                <TextInput
                  style={styles.input}
                  placeholder="Trouver mon siège..."
                  value={zone}
                  onChangeText={setZone}
                />
                <TouchableOpacity
                  style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#A5ECC0' }}
                  onPress={handleAddZone}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter ma zone</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

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
              {zoneUsers.length === 0 ? (
                <Text>Aucun autre utilisateur dans cette zone.</Text>
              ) : (
                zoneUsers.filter(u => u.token !== user.token)
                  .map((u, i) => (
                    <TouchableOpacity key={i} onPress={() => viewProfile(u)}>
                      <Text key={i}>{u.username}</Text>
                    </TouchableOpacity>
                  ))
              )}
              <TouchableOpacity
                style={{ marginTop: 20, padding: 10, borderRadius: 8 }}
                onPress={() => setUsersModalVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.wrapper}>{userPosts}</View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    width: '95%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  head: {
    marginTop: 40,
    marginBottom: 20,
    width: '95%',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 10,
    backgroundColor: '#E8EAED',
    borderWidth: 2,
    borderColor: '#A5ECC0',
    borderRadius: 12,
  },
  wrapper: {
    width: '90%',
    height: '60%',
    backgroundColor: '#E8EAED',
    borderRadius: 12,
    borderwidth: 2,
    borderColor: '#A5ECC0',
    marginBottom: 40,
  },
  postWrapper: {
    flexDirection: 'row',
    padding: 20,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
  },
  profilePic: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  noSeatmapText: {
    fontSize: 16,
    color: '#565656',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(29, 3, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 5,
    elevation: 5,
    width: '95%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenSeatmap: {
    width: '100%',
    height: '90%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  input: {
    width: 300,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    textAlign: 'center',
    backgroundColor: "#E8EAED",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
});