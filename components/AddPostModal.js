import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addPost } from "../reducers/post";
import CameraModal from "./CameraModal";
import { LinearGradient } from "expo-linear-gradient";

export default function AddPostModal({
  isVisible,
  setIsVisible,
  reloadFunction,
}) {
  const [postContent, setPostContent] = useState("");
  const token = useSelector((state) => state.user.value.token);
  const dispatch = useDispatch();
  const [showCamera, setShowCamera] = useState(false);

  //créer un post
  const newPost = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/posts/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: postContent }),
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
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={["#A5ECC0", "#E2A5EC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { width: "90%", height: 200 }]}
          >
            <View style={styles.modalContainer}>
              <View style={{ height: "100%", justifyContent: 'flex-end' }}>
              <TextInput
                placeholder="Ajouter un post"
                value={postContent}
                onChangeText={setPostContent}
                style={styles.input}
              />
                <View style={styles.tabContainer}>
                  <TouchableOpacity style={styles.tab} onPress={newPost}>
                    <Text>Poster</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => {
                      setIsVisible(false);
                      setTimeout(() => setShowCamera(true), 500);
                    }}
                  >
                    <Text>Prendre une photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleCancelPost()}
                  >
                    <Text>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(245, 245, 245)",
    borderColor: "#A5ECC0",
    borderRadius: 11,
  },
  input: {
    width: "90%",
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
});
