import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ImageBackground,
  Pressable
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../reducers/user";
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const [emailUp, setEmailUp] = useState("");
  const [usernameUp, setUsernameUp] = useState("");
  const [passwordUp, setPasswordUp] = useState("");
  const [usernameIn, setUsernameIn] = useState("");
  const [passwordIn, setPasswordIn] = useState("");

  const handleSignup = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameUp,
        password: passwordUp,
        email: emailUp,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        dispatch(login(data.token));
        navigation.reset({
          index: 0,
          routes: [{ name: "TabNavigator" }],
        });
        setPasswordUp("");
        setUsernameUp("");
        setEmailUp("");
        setSignupOpen(false);
      });
  };

  const handleSignin = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameIn, password: passwordIn }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        dispatch(login(data.token));
        navigation.reset({
          index: 0,
          routes: [{ name: "TabNavigator" }],
        });
        setPasswordIn("");
        setUsernameIn("");
        setSigninOpen(false);
      });
  };

  const handleCancel = () => {
    setSignupOpen(false);
    setSigninOpen(false);
  };

  useEffect(() => {
    if (user.token) {
      navigation.navigate("TabNavigator");
    }
  }, []);

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Bienvenue sur ConcertPal</Text>
          <Text style={styles.paragraph}>Vous n'avez pas de compte?</Text>

          {/* ───── ⋆ ───── Bouton Sign Up ───── ⋆ ───── */}
          <LinearGradient
            colors={['#A5ECC0', '#E2A5EC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { width: '75%', height: 50 }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setSignupOpen(true)}>
              <Text style={styles.buttonText}>Créer un compte</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.paragraph}>Vous possédez déja un compte ?</Text>

          {/* ───── ⋆ ───── Bouton Sign In ───── ⋆ ───── */}
          <LinearGradient
            colors={['#E2A5EC', '#A5A7EC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { width: '75%', height: 50 }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setSigninOpen(true)}>
              <Text style={styles.buttonText}>Connexion</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ───── ⋆ ───── Modal Sign Up ───── ⋆ ───── */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={signupOpen}
          onRequestClose={handleCancel}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackground} onPress={handleCancel} />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Crée ton compte ConcertPal
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={emailUp}
                  onChangeText={setEmailUp}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nom d'utilisateur"
                  value={usernameUp}
                  onChangeText={setUsernameUp}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  secureTextEntry
                  value={passwordUp}
                  onChangeText={setPasswordUp}
                />

                <LinearGradient
                  colors={['#E2A5EC', '#A5A7EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: '75%', height: 50 }]}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: 'transparent' }]}
                    onPress={handleSignup}>
                    <Text
                      style={[
                        styles.buttonText,
                        { color: 'rgb(245, 245, 245)' },
                      ]}>
                      Créer un compte
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#E2A5EC', '#A5A7EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: '75%', height: 50 }]}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCancel}>
                    <Text style={styles.buttonText}>Annuler</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* ───── ⋆ ───── Modal Sign Up ───── ⋆ ───── */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={signinOpen}
          onRequestClose={handleCancel}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackground} onPress={handleCancel} />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Connexion a ConcertPal</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom d'utilisateur"
                  value={usernameIn}
                  onChangeText={setUsernameIn}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  secureTextEntry
                  value={passwordIn}
                  onChangeText={setPasswordIn}
                />

                <LinearGradient
                  colors={['#E2A5EC', '#A5A7EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: '75%', height: 50 }]}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: 'transparent' }]}
                    onPress={handleSignin}>
                    <Text
                      style={[
                        styles.buttonText,
                        { color: 'rgb(245, 245, 245)' },
                      ]}>
                      Connexion
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#E2A5EC', '#A5A7EC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradient, { width: '75%', height: 50 }]}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCancel}>
                    <Text style={styles.buttonText}>Annuler</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    backgroundColor: 'rgba(245, 245, 245, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    height: '75%',
    alignSelf: 'flex-start',
    borderTopRightRadius: 150,
    borderBottomRightRadius: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgb(120, 122, 197)',
    marginBottom: 8,
    textAlign: 'center',
  },
  paragraph: {
    color: 'rgb(120, 122, 197)',
    marginTop: 30,
    marginBottom: 10,
    left: 10,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 11,
  },
  gradient: {
    padding: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'rgb(120, 122, 197)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
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
    backgroundColor: 'rgb(245, 245, 245)',
    margin: 20,
    borderRadius: 12,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(120, 122, 197)',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingVertical: 5,
    width: '90%'
  },
  modalButton: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#6366F1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signinButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
});
