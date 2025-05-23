import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";

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
  const { artist, city, venue, seatmap, pic, date } = route.params;
  const formattedDate = moment(date).format("DD/MM/YYYY");
  const [modalVisible, setModalVisible] = useState(false);

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

        {/* ───── ⋆ ───── Modal pour la seatmap ───── ⋆ ───── */}
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
              <TextInput style={styles.input} placeholder="Trouver mon siège..." />
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