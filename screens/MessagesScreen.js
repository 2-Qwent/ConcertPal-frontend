import { Button, StyleSheet, Text, View, TouchableOpacity, ImageBackground, SafeAreaView, Image } from 'react-native';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from '@react-navigation/native';
import moment from "moment";
import 'moment/locale/fr'; // Import French locale for moment.js
import Icon from "react-native-vector-icons/FontAwesome";

export default function MessagesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const user = useSelector((state) => state.user.value);
  const [messagesData, setMessagesData] = useState([]);
  useEffect(() => {
    if (!user.token) {
      navigation.navigate("Login");
    }
    if (!isFocused) return;
    fetch(
      `https://concert-pal-backend.vercel.app/messages/last/${user.token}`
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
      avatar: sender.destinataire.avatar,
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
        <Image
          source={
            !data.destinataire.avatar || data.destinataire.avatar === "default_avatar"
              ? require('../assets/default_avatar.png')
              : { uri: data.destinataire.avatar }
          }
          style={styles.userAvatar}
        />
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 250,
              padding: 10,
            }}
          >
            <Text style={styles.username}>{data.destinataire.username}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.head}>Boîte de reception</Text>
        <View style={styles.messagerieWrapper}>
          <View style={styles.wrapper}>{messages}</View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 70,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  head: {
    width: 350,
    height: 50,
    margin: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 10,
    backgroundColor: 'rgb(245, 245, 245)',
    borderWidth: 2,
    borderColor: '#A5ECC0',
    borderRadius: 12,
  },
  messagerieWrapper: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'rgb(245, 245, 245)',
    borderColor: '#D7D7D7',
    borderRadius: 12,
    width: '95%',
    height: '90%',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '55%',
    borderRadius: 12,
    borderwidth: 2,
    borderColor: '#A5ECC0',
  },
  postWrapper: {
    flexDirection: 'row',
    padding: 20,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageBody: {
    width: 250,
    padding: 10,
    marginBottom: 5,
    fontSize: 13,
    color: '#464646',
    left: 10,
  },
  username: {
    fontWeight: '500',
    fontSize: 15,
  },
  date: {
    color: '#565656',
    fontSize: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A5ECC0",
  },
});