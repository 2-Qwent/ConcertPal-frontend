import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";

// ───── ⋆ ───── A remplacer par de vrais messages ───── ⋆ ─────
const messagesData = [
  {
    sender: "John Doe",
    date: "20/05/2025",
    messageBody: "It was so nice meeting you!",
  },
  {
    sender: "Jane Doe",
    date: "20/05/2025",
    messageBody: "Should we go to the next tour together?",
  },
  {
    sender: "Lauren",
    date: "20/05/2025",
    messageBody: "I found your keys! We should meet so I can give them back",
  },
];

export default function MessagesScreen({ navigation }) {
  const handlePress = (sender) => {
    console.log('clicked message is from : ', sender);
    navigation.navigate('ChatScreen', {
      sender,
    });
  };

  const messages = messagesData.map((data, i) => {
    return (
      <TouchableOpacity
        onPress={() => handlePress(data.sender)}
        style={styles.postWrapper}
        key={i}>
        <View style={styles.profilePic}>
          <FontAwesome name="user-circle" size={45} color="#000000" />
          <Text style={{ fontSize: 7, color: 'rgba(0,0,0,0.5)' }}>
            placeholder profile pic
          </Text>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: 250,
              padding: 10,
            }}>
            <Text>{data.sender}</Text>
            <Text>{data.date}</Text>
          </View>
          <Text style={styles.messageBody}>{data.messageBody}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.head}>Messagerie</Text>
      <View style={styles.messagerieWrapper}>
        <View style={styles.wrapper}>{messages}</View>
      </View>
    </View>
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
    backgroundColor: '#E8EAED',
    borderWidth: 2,
    borderColor: '#A5ECC0',
    borderRadius: 12,
  },
  messagerieWrapper: {
    width: '95%',
    height: '80%',
    backgroundColor: '#E8EAED',
    borderRadius: 12,
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '55%',
    backgroundColor: '#E8EAED',
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