import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from "react";
import Pusher from 'pusher-js/react-native';
import { useSelector } from "react-redux";

export default function ChatScreen({ route }) {
  const user = useSelector((state) => state.user.value);
  const { sender, token } = route.params;
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
    <View style={[
      styles.messageBubble,
      item.sender === "IfAA0dFdGHEZRjDJyc1rTnFwEj74XHox" ? styles.myMessage : styles.otherMessage
    ]}>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.head}>Messages with {sender}</Text>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ padding: 10 }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  head: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#A5ECC0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  messageBubble: {
    marginVertical: 4,
    maxWidth: '70%',
    padding: 10,
    borderRadius: 15,
  },
  myMessage: {
    backgroundColor: '#A5ECC0',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E2A5EC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
});