import { Button, StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from '@react-navigation/native';
import moment from "moment";
import 'moment/locale/fr'; // Import French locale for moment.js
import Icon from "react-native-vector-icons/FontAwesome";

export default function MessagesScreen({ navigation, toggleTabBar }) {
  const isFocused = useIsFocused();
  const user = useSelector((state) => state.user.value);
  const [messagesData, setMessagesData] = useState([]);
  useEffect(() => {
    if (!isFocused) return;
    fetch(
      `http://${process.env.EXPO_PUBLIC_IP}:3000/messages/last/${user.token}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setMessagesData(data.messages);
        } else {
          console.error("Failed to fetch messages:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }, [user.token, isFocused]);

  const handlePress = (sender) => {
    navigation.navigate("ChatScreen", {
      sender: sender.destinataire.username,
      token: sender.destinataire.token,
    });
  };

  const messages = messagesData.map((data, i) => {
    moment.locale("fr"); // Heure en français
    const formattedDate = moment(data.date).fromNow();
    return (
      <TouchableOpacity
        onPress={() => handlePress(data)}
        style={styles.postWrapper}
        key={i}
      >
        <View style={styles.profilePic}>
          <FontAwesome name="user-circle" size={45} color="#000000" />
          <Text style={{ fontSize: 7, color: "rgba(0,0,0,0.5)" }}>
            placeholder profile pic
          </Text>
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 250,
              padding: 10,
            }}
          >
            <Text>{data.destinataire.username}</Text>
            <Text>{formattedDate}</Text>
          </View>
          <Text style={styles.messageBody}>{data.message}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.head}>Messagerie</Text>
        <View style={styles.messagerieWrapper}>
          <View style={styles.wrapper}>{messages}</View>
        </View>
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
  head: {
    marginTop: 40,
    marginBottom: 20,
    width: '95%',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 10,
    backgroundColor: 'rgb(245, 245, 245)',
    borderWidth: 2,
    borderColor: '#A5ECC0',
    borderRadius: 12,
  },
  messagerieWrapper: {
    width: '95%',
    height: '80%',
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 12,
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '55%',
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 12,
    borderwidth: 2,
    borderColor: '#A5ECC0',
  },
  postWrapper: {
    flexDirection: 'row',
    padding: 20,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
  },
  messageBody: {
    width: 250,
    padding: 10,
  },
});