import { Button, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen({ navigation }) {
 return (
   <View style={styles.container}>
     <Text style={styles.head}>Messagerie</Text>
     <View>
      
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
  head : {
    marginTop:40,
    marginBottom: 20,
    width: "95%",
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 10,
    backgroundColor: "#E8EAED",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
});