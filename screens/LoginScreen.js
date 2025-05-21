// ConcertPal-frontend/screens/SigninScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, updateToken } from '../reducers/user';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  // const user = useSelector((state) => state.user.value)

  const [signupOpen, setSignupOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const [emailUp, setEmailUp] = useState('')
  const [usernameUp, setUsernameUp] = useState('')
  const [passwordUp, setPasswordUp] = useState('')
  const [usernameIn, setUsernameIn] = useState('')
  const [passwordIn, setPasswordIn] = useState('')

  const handleSignup = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameUp, password: passwordUp, email: emailUp }),
    })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          dispatch(login(data.token))
          navigation.navigate('TabNavigator')
          setPasswordUp('');
          setUsernameUp('');
          setEmailUp('');
          setSignupOpen(false)
        })
  }

  const handleSignin = () => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameIn, password: passwordIn }),
    })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          dispatch(login(data.token ))
          navigation.navigate('TabNavigator')
          setPasswordIn('');
          setUsernameIn('');
          setSigninOpen(false)
        })
  }

  const handleCancel = () => {
    setSignupOpen(false);
    setSigninOpen(false)
  };

/*  useEffect(() => {
    if (user) {
      navigation.navigate('Home')
    }
  }, []);*/

  return (
      <View style={styles.container}>
          <View style={styles.btnContainer}>
            <Text style={styles.title}>See what's happening</Text>
            <Text style={styles.join}>Join ConcertPal today.</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setSignupOpen(true)}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={signupOpen}
                onRequestClose={handleCancel}
            >
              <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Create your ConcertPal account</Text>

                  <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={emailUp}
                      onChangeText={setEmailUp}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Username"
                      value={usernameUp}
                      onChangeText={setUsernameUp}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      value={passwordUp}
                      onChangeText={setPasswordUp}
                  />

                  <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleSignup}
                  >
                    <Text
                        style={styles.buttonText}>Sign up</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            <Text style={styles.already}>Already have an account?</Text>

            <TouchableOpacity
                style={[styles.button, styles.signinButton]}
                onPress={() => setSigninOpen(true)}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={signinOpen}
                onRequestClose={handleCancel}
            >
              <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Connect to ConcertPal</Text>

                  <TextInput
                      style={styles.input}
                      placeholder="Username"
                      value={usernameIn}
                      onChangeText={setUsernameIn}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      value={passwordIn}
                      onChangeText={setPasswordIn}
                  />

                  <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleSignin}
                  >
                    <Text style={styles.buttonText} onPress={handleSignin}>Sign in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </View>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  join: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  already: {
    color: '#FFFFFF',
    marginTop: 30,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    margin: 20,
    borderRadius: 15,
    padding: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 8,
    color: '#FFFFFF',
    marginBottom: 15,
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
