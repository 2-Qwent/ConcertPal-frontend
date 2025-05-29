import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from "react";
import Pusher from 'pusher-js/react-native';
import { useSelector } from "react-redux";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.value);
  const { sender, token, avatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const myToken = user.token;
  const otherToken = token;
  const channelName = [myToken, otherToken].sort().join('-');

  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/messages/chat-${channelName}`)
      .then(res => res.json())
      .then(data => {
        if (data.result) setMessages(data.history);
      });

    const pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_APP_KEY, {
      cluster: "eu",
    });

    const channel = pusher.subscribe(`chat-${channelName}`);
    channel.bind('new-message', function (data) {
      setMessages(prev => [...prev, data]);
    });

    // Cleanup à la fermeture du composant
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [channelName]);

  const handleSend = () => {
    if (!input.trim()) return;

    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/messages/send`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: `chat-${channelName}`,
        sender: myToken,
        message: input,
      }),
    });
    setInput('');
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: item.sender === myToken ? 'flex-end' : 'flex-start', // Aligne à droite pour myMessage
      }}
    >
      {item.sender !== myToken && (
        <Image
          source={
            !avatar || avatar === "default_avatar"
              ? require('../assets/default_avatar.png')
              : { uri: avatar }
          }
          style={styles.userAvatar}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          item.sender === myToken ? styles.myMessage : styles.otherMessage,
        ]}>
        <Text style={[item.sender === myToken ? styles.myMessageText : styles.messageText,]}>
          {item.message}
        </Text>
      </View>
      {item.sender === myToken && (
        <View style={{ width: 30, height: 30, marginRight: 10 }} /> // Espace pour aligner myMessage
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }}>
          <View style={styles.headContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginRight: 10 }}>
              <FontAwesome name="chevron-left" size={24} color="#565656" />
            </TouchableOpacity>
            <Text style={styles.head}>Messages avec {sender}</Text>
          </View>
          <View style={styles.messagerieWrapper}>
            <FlatList
              data={messages}
              renderItem={renderItem}
              keyExtractor={(_, i) => i.toString()}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{ padding: 10 }}
            />
          </View>
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={['#E2A5EC', '#A5A7EC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradient, { width: '75%', height: 50 }]}>
              <TextInput
                style={styles.input}
                value={input}
                multiline
                onChangeText={setInput}
                placeholder="Écrire un message..."
              />
            </LinearGradient>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '95%',
    margin: 10,
  },
  head: {
    width: '90%',
    height: 50,
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
    flex: 1,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    alignItems: 'center',
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
    borderRadius: 20,
    justifyContent: 'center',
    margin: 10
  },
  input: {
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: '100%',
    height: '100%',
    borderRadius: 18,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#A5A7EC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  messageBubble: {
    marginVertical: 4,
    maxWidth: '70%',
    padding: 10,
  },
  myMessage: {
    backgroundColor: '#A5ECC0',
    alignSelf: 'flex-end',
    color: '#565656',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  otherMessage: {
    backgroundColor: '#565656',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  messageText: {
    fontSize: 16,
    color: 'rgb(245, 245, 245)',
  },
  myMessageText: {
    fontSize: 16,
    color: '#565656',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
});