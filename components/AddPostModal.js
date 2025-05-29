import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Text,
  Pressable,
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
}) {
  const [postContent, setPostContent] = useState("");
  const token = useSelector((state) => state.user.value.token);
  const dispatch = useDispatch();
  const [showCamera, setShowCamera] = useState(false);
  const concerts = useSelector((state) => state.concerts.value) || []; // Récupération des concerts de l'utilisateur via le store Redux
  const [value, setValue] = useState(null); // Valeur de l'item sélectionné dans le menu dropdown

  //Données des concerts pour le menu dropdown
  const concertData = concerts.map((concert) => ({
    label: `${concert.artist} - ${concert.city} - ${moment(concert.date).format('L')}`,
    value: concert._id,
    artist: concert.artist,
    city: concert.city,
    date: concert.date,
  }));
  

  //créer un post
  const newPost = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${token}`, {
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

  const handleCameraClose = () => {
    setShowCamera(false);
    setIsVisible(true);
  };

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
            onPress={() => {setIsVisible(false); setValue(null)}}
          />
          <LinearGradient
            colors={["#A5ECC0", "#E2A5EC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { width: "90%", height: 200 }]}
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
                  <Text style={{ color: "white" }}>Poster</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => {
                    setIsVisible(false);
                    setTimeout(() => setShowCamera(true), 500);
                  }}
                >
                  <Text style={{ color: "white" }}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => handleCancelPost()}
                >
                  <Text style={{ color: "white" }}>Annuler</Text>
                </TouchableOpacity>
              </View>
              <Dropdown
                style={styles.dropdownMenu}
                placeholder="Rechercher un concert"
                data={concertData}
                search
                searchPlaceholder="Choisissez un concert"
                onChange={(item) => {
                  setValue(item.value);
                }}
                value={value}
                labelField="label"
                valueField="value"
                renderItem={(item) => (
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>{item.artist}</Text>
                    <Text>
                      {item.city} - {moment(item.date).format("L")}
                    </Text>
                  </View>
                )}
              />
              {value && (
                <TouchableOpacity
                  style={{ marginTop: 8, alignSelf: "center" }}
                  onPress={() => setValue(null)}
                >
                  <Text style={{ color: "#A5A7EC" }}>Effacer la sélection</Text>
                </TouchableOpacity>
              )}
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
    height: "100%",
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
    color: "rgb(245, 245, 245)",
    backgroundColor: "#A5A7EC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: "center",
    margin: 10,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(29, 3, 0, 0.6)',
  },
  dropdownMenu: {
    width: '60%',
    height: 50
  }
});
