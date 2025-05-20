import { Button, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen({ navigation }) {
 return (
   <View style={styles.container}>
     <Text>Messages screen</Text>
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