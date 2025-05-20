import { Button, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen({ navigation }) {
 return (
   <View style={styles.container}>
     <Text>Login Screen</Text>
     <Button
       title="Go to Home"
       onPress={() => navigation.navigate('TabNavigator')}
     />
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