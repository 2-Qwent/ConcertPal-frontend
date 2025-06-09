import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Alert
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addPost } from "../reducers/post";
import CameraModal from "./CameraModal";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from 'react-native-element-dropdown';
import moment from "moment";


export default function AddPostModal({
  isVisible,
  setIsVisible,
  reloadFunction,
  defaultConcertId
}) {
  const [postContent, setPostContent] = useState(""); // Etat contenant le contenu du post (input)
  const token = useSelector((state) => state.user.value.token); // Récupération du token de l'utilisateur
  const dispatch = useDispatch();
  const [showCamera, setShowCamera] = useState(false); // Etat pour ouvrir et fermer la caméra
  const concerts = useSelector((state) => state.concerts.value) || []; // Récupération des concerts de l'utilisateur via le store Redux
  const [value, setValue] = useState(defaultConcertId || null); // Valeur de l'item sélectionné dans le menu dropdown
  const [concertModalVisible, setConcertModalVisible] = useState(false); // Modal sélection de concert

  const selectedConcert = concerts.find((c) => c._id === value); // Concert sélectionné par l'utilisateur

  // On set la valeur au concert par défaut (si post depuis le ConcertScreen) ou à null
  useEffect(() => {
    if (isVisible) {
      setValue(defaultConcertId || null)
    }
  }, [isVisible, defaultConcertId])

  //créer un post
  const newPost = () => {
    if (!postContent.trim()) {
      Alert.alert("Erreur", "Le contenu du post ne peut pas être vide.")
    }
    fetch(`https://concert-pal-backend.vercel.app/posts/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: postContent, concertId: value }),
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(addPost(data.post));
        reloadFunction();
        setPostContent("");
        setIsVisible(false);
      });
  };

  //annuler la création du post
  const handleCancelPost = () => {
    setPostContent("");
    setValue(null)
    setShowCamera(false);
    setIsVisible(false);
  };

  // Fermer la caméra
  const handleCameraClose = () => {
    setShowCamera(false);
    setIsVisible(true);
  };

  // Modal de sélection de concert
  const concertModalContent = (
    <Modal
      visible={concertModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setConcertModalVisible(false)}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setConcertModalVisible(false)}
      >
        <View style={styles.modalConcertListContainer}>
          {concerts.length === 0 ? (
          <Text style={{ fontWeight: "bold", marginBottom: 10, textAlign: 'center' }}>
            Aucun concert dans ma liste
          </Text>
          ) : (
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Choisir un concert
          </Text>
          )}
          <ScrollView>
            {concerts.map((concert, i) => (
              <TouchableOpacity
                key={i}
                style={[ styles.selectedConcert, { backgroundColor: value === concert._id ? "#a5ecc0" : "#eee", } ]}
                onPress={() => {
                  if (value === concert._id) {
                    setValue(null); // Si déjà sélectionné, on déselectionne
                  } else {
                    setValue(concert._id); // Sinon, on sélectionne
                  }
                  setConcertModalVisible(false);
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{concert.artist}</Text>
                <Text>
                  {concert.city} - {moment(concert.date).format("L")}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                marginTop: 8,
                alignSelf: "center",
                backgroundColor: "#a5ecc0",
                borderRadius: 8,
                padding: 8,
              }}
              onPress={() => {
                setValue(null);
                setConcertModalVisible(false);
              }}
            >
              {value ? (
                <Text style={{ color: "#fff" }}>Désélectionner</Text>
              ) : (
                <Text style={{ color: "#fff" }}>Annuler</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <>
      {showCamera && <CameraModal onClose={handleCameraClose} />}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable
            style={styles.modalBackground}
            onPress={() => {
              setIsVisible(false);
              setValue(null);
            }}
          />
          <LinearGradient
            colors={["#A5ECC0", "#E2A5EC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { width: "90%", height: 355 }]}
          >
            <View style={styles.modalContainer}>
              <TextInput
                placeholder="Ajouter un post"
                value={postContent}
                onChangeText={setPostContent}
                multiline
                style={styles.input}
              />
              <View style={styles.tabContainer}>
                  <TouchableOpacity style={styles.tab} onPress={newPost}>
                    <Text style={{ color: "#fff", fontWeight: 'bold' }}>Poster</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => {
                      setIsVisible(false);
                      setTimeout(() => setShowCamera(true), 500);
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: 'bold' }}>Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelTab}
                    onPress={() => handleCancelPost()}
                  >
                    <Text style={{ color: 'rgb(120, 122, 197)' }}>Annuler</Text>
                  </TouchableOpacity>
              </View>
              <View style={{ marginVertical: 10 }}>
                {defaultConcertId ? (
                  // Affichage en lecture seule quand on appuie depuis ConcertScreen
                    <View
                      style={{
                        borderRadius: 10,
                        padding: 10,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        minWidth: 250,
                        borderWidth: 1,
                        borderColor: "#A5A7EC",
                        marginVertical: 10,
                      }}
                    >
                      <Text style={{ color: "#1D0322", fontWeight: "bold" }}>
                        {selectedConcert
                          ? `${selectedConcert.artist} - ${
                              selectedConcert.city
                            } - ${moment(selectedConcert.date).format("L")}`
                          : ""}
                      </Text>
                    </View>
                ) : (
                  // Ouvre la sélection
                  <LinearGradient
                    colors={["#A5ECC0", "#E2A5EC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.gradient,
                      { width: 300, alignSelf: "center" },
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        borderRadius: 10,
                        padding: 10,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        minWidth: 250,
                      }}
                      onPress={() => setConcertModalVisible(true)}
                    >
                      <Text style={{ color: 'rgb(120, 122, 197)' }}>
                        {selectedConcert
                          ? `${selectedConcert.artist} - ${
                              selectedConcert.city
                            } - ${moment(selectedConcert.date).format("L")}`
                          : "Sélectionner un concert"}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
                {!defaultConcertId && value && (
                  <TouchableOpacity
                    style={{ marginTop: 8, alignSelf: "center" }}
                    onPress={() => setValue(null)}
                  >
                    <Text style={{ color: "#A5A7EC" }}>
                      Effacer la sélection
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {concertModalContent}
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    height: 350,
    backgroundColor: "rgb(245, 245, 245)",
    borderColor: "#A5ECC0",
    borderRadius: 11,
  },
  input: {
    width: "90%",
    maxHeight: 120,
    borderBottomColor: "#A5ECC0",
    borderBottomWidth: 1,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
    paddingBottom: 15,
    justifyContent: "space-around",
    borderColor: "#D7D7D7",
  },
  tab: {
    width: 80,
    height: 50,
    backgroundColor: "#A5ECC0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cancelTab: {
    width: 80,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderColor: "#A5ECC0",
    borderWidth: 2,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: "center",
    margin: 10,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(29, 3, 0, 0.6)",
  },
  dropdownMenu: {
    width: "60%",
    height: 50,
  },
  modalConcertListContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    minWidth: "70%",
    maxHeight: 300,
  },
  selectedConcert: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
});
