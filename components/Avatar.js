import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome } from '@fortawesome/react-native-fontawesome';
import { SafeAreaView } from 'react-native-safe-area-context';

const AvatarSelector = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à la galerie.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleSelectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (!result.canceled) {
        await updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const updateAvatar = async (imageUri) => {
    setLoading(true);
    try {
      // Ici, vous devriez d'abord upload l'image vers votre serveur ou service de stockage
      // Par exemple, vers AWS S3 ou un autre service
      // Simulons une URL retournée par le service de stockage
      const avatarUrl = imageUri; // À remplacer par l'URL réelle après upload

      const response = await fetch('VOTRE_API_URL/users/update-avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Si vous utilisez JWT
        },
        body: JSON.stringify({
          userId: user.id,
          avatarUrl: avatarUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ 
          type: 'UPDATE_USER_AVATAR', 
          payload: avatarUrl 
        });
        Alert.alert('Succès', 'Avatar mis à jour avec succès');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={handleSelectImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Image
              source={{ 
                uri: user.avatar || 'https://votre-url-avatar-par-defaut.com/default.png'
              }}
              style={styles.avatar}
            />
            <View style={styles.editIconContainer}>
              <FontAwesome 
                icon="camera" 
                style={styles.editIcon}
              />
            </View>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AvatarSelector;