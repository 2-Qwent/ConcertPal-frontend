import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";

const EditProfileModal = ({ isVisible, setIsVisible, user, reloadFunction }) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger l'image");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      if (username !== user.username) {
        formData.append('username', username);
      }

      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          type: 'image/jpeg',
          name: 'avatar.jpg'
        });
      }

      console.log("FormData:", formData);
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/user/${user.token}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      console.log(data)
      if (data.success) {
        reloadFunction();
        setIsVisible(false);
        Alert.alert("Succès", "Profil mis à jour avec succès");
      } else {
        Alert.alert("Erreur", data.message);
        console.error("Erreur lors de la mise à jour du profil :", data);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.modalBackground}
          onPress={() => setIsVisible(false)}
        />
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={{ uri: avatar ? avatar.uri : user.avatar }}
              style={styles.avatarPreview}
            />
            <Text style={styles.changeAvatarText}>Changer l'avatar</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#666"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Mise à jour..." : "Valider"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '5%',
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
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: '5%',
  },
  avatarPreview: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#A5ECC0',
    marginBottom: '3%',
  },
  changeAvatarText: {
    color: '#A5A7EC',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#E8EAED',
    borderRadius: 12,
    paddingHorizontal: '4%',
    marginBottom: '5%',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: '3%',
  },
  button: {
    width: '45%',
    padding: '3%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#A5ECC0',
  },
  cancelButton: {
    backgroundColor: '#E8EAED',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  }
});

export default EditProfileModal;