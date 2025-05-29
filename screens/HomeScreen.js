import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import { Button } from "@ant-design/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import Concert from "../components/Concert";
import Post from "../components/Post";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { setPosts } from "../reducers/post";
import { setConcerts } from "../reducers/concerts";
import { persistor } from "../App"
import AddPostModal from "../components/AddPostModal";
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {

  const [modalVisible, setModalVisible] = useState(false); // Modal visible oui / non
  const [showPicker, setShowPicker] = useState(false); // Menu choix date
  const [reload, setReload] = useState(false); // Reload
  const [artist, setArtist] = useState(""); // Input artistes recherches concert
  const [venue, setVenue] = useState(""); // Lieu de venue pour chaques artistes
  const [searchError, setSearchError] = useState(""); // Message d'erreur définissable
  const [concerts, setConcerts] = useState([]); // États pour la liste des concerts
  const [date, setDate] = useState(null); // Date
  const [isVisible, setIsVisible] = useState(false); // Modal pour ajouter un post

  const posts = useSelector((state) => state.post.value) // Appel des posts
  const user = useSelector((state) => state.user.value);
  const token = user.token;
  const dispatch = useDispatch()

  const handleAddPostModal = () => {
    setIsVisible(true);
  };

  const reloadFunction = () => {
    setReload(!reload)
  }

  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(setPosts(data.posts));
      });
  }, [reload]);

  const handleSearch = () => {
    const searchParams = { artist, venue };
    if (date) {
      searchParams.date = date.toISOString().split("T")[0];
    }

    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchParams),
    })
      .then((response) => response.json())
      .then((data) => {
        const showData = data.concerts.map((show) => ({
          artist: show.name,
          venue: show._embedded?.venues?.[0]?.name || "Lieu inconnu",
          date: show.dates?.start?.localDate || "Date inconnue",
          pic: show.images?.[3]?.url || null,
          city: show._embedded?.venues?.[0]?.city?.name || "Ville inconnue",
          seatmap: show.seatmap?.staticUrl || "Pas de plan pour ce spectacle",
        }));
        setConcerts(showData);
        if (showData.length === 0) {
          alert("Aucun concert trouvé pour ces critères de recherche.");
        }
      })
      .catch((error) => {
        console.error("Erreur pendant la recherche de concerts :", error);
      });
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      // utilisateur a annulé la sélection
      setShowPicker(false);
      return;
    }
    setDate(selectedDate);
    setShowPicker(false);
  };

  const concertsList = concerts.map((data, i) => {
    return (
      <Concert
        key={i}
        pic={data.pic}
        city={data.city}
        venue={data.venue}
        artist={data.artist}
        date={data.date}
        seatmap={data.seatmap}
        screen="Home"
      />
    );
  });

  const timeline = posts.map((data, i) => {
    if (!data) return null

    const isLiked = data.likes?.some((post) => post === token);
    return (
        <Post
            key={i}
            username={data.author?.username}
            text={data.text}
            date={moment(data.date).fromNow()}
            nbLikes={data.likes.length}
            isLiked={isLiked}
            reloadFunction={reloadFunction}
            {...data}
        />
    );
  }).filter(Boolean);

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        <LinearGradient
          colors={['#A5ECC0', '#E2A5EC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, {width: 350, height: 50}]}>
          <TouchableOpacity
            style={[styles.button, { width: '100%', height: '100%' }]}
            onPress={() => setModalVisible(true)}>
            <Text>Rechercher un concert</Text>
          </TouchableOpacity>
        </LinearGradient>
        {/* <Text>Feed</Text> */}
        <View style={styles.timelineContainer}>
          <ScrollView
            style={{
              maxHeight: 550,
              width: '100%',
              margin: 10,
              borderRadius: 12,
            }}>
            {timeline}
          </ScrollView>
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
        </View>
        {/* ───── ⋆ ───── Purge store ───── ⋆ ───── */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              borderColor: 'red',
              width: 90,
              height: 20,
              backgroundColor: 'white',
              borderWidth: 1,
            },
          ]}
          onPress={() => {
            persistor.purge();
          }}>
          <Text style={{ color: 'red', fontSize: 10 }}>X purge store</Text>
        </TouchableOpacity>

        {/* ───── ⋆ ───── searchModal ───── ⋆ ───── */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackground}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContainer}>
              {concerts.length === 0 ? (
                <>
                  <Text style={styles.title}>Rechercher un concert</Text>
                  {searchError ? (
                    <Text style={styles.errorText}>{searchError}</Text>
                  ) : null}
                  <TextInput
                    placeholder="Artiste"
                    style={styles.input}
                    value={artist}
                    onChangeText={setArtist}
                  />
                  <TextInput
                    placeholder="Lieu"
                    style={styles.input}
                    value={venue}
                    onChangeText={setVenue}
                  />

                  <TouchableOpacity
                    style={styles.datePicker}
                    onPress={() => setShowPicker(true)}>
                    <Icon name="calendar" size={20} color="#333" />
                    <Text style={styles.dateText}>
                      {date ? date.toISOString().split('T')[0] : 'Date'}
                    </Text>
                  </TouchableOpacity>

                  {showPicker && (
                    <DateTimePicker
                      value={date || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}

                  {date && (
                    <Button
                      onPress={() => setDate(null)}
                      style={{ marginBottom: 10 }}>
                      Effacer la date
                    </Button>
                  )}

                  <View style={styles.buttons}>
                    <Button type="primary" onPress={handleSearch}>
                      Rechercher
                    </Button>
                    <Button
                      onPress={() => setModalVisible(false)}
                      style={{ marginTop: 10 }}>
                      Annuler
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Résultats</Text>
                  <ScrollView style={{ maxHeight: 400, marginBottom: 10 }}>
                    {concertsList}
                  </ScrollView>
                  <Button
                    onPress={() => {
                      setConcerts([]);
                      setModalVisible(false);
                    }}>
                    Fermer
                  </Button>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: '-50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingVertical: 5,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttons: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    width: 200,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 11,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: 'center',
    margin: 10
  },
  buttonAdd: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    backgroundColor: 'rgb(250, 250, 250)',
    borderRadius: 11,
  },
  timelineContainer: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'rgb(245, 245, 245)',
    borderColor: '#D7D7D7',
    borderRadius: 12,
    width: '95%',
    height: 550,
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
});