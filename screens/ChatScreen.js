import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";

// ───── ⋆ ───── A remplacer par de vrais messages ───── ⋆ ─────
const messagesData = [
  {
    sender: "John Doe",
    date: "20/05/2025",
    messageBody: "It was so nice meeting you!",
  },
  {
    sender: "Me",
    date: "20/05/2025",
    messageBody: "yes!",
  },
  {
    sender: "Me",
    date: "20/05/2025",
    messageBody: "let's meet again next time",
  },
];

export default function ChatScreen({ route, navigation }) {
  const { sender } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.head}>Messages with {sender}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});