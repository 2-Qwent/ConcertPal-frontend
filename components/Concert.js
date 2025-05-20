import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';

export default function Concert(props) {
  return (
    <View style={styles.card}>
      <ImageBackground source={{ uri: props.pic }} style={styles.image} imageStyle={{ borderRadius: 10 }}>
        <View style={styles.overlay}>
          <Text style={styles.title}>{props.artist}</Text>
          <Text style={styles.text}>{props.venue} - {props.city}</Text>
          <Text style={styles.text}>{props.date}</Text>
          <TouchableOpacity style={styles.button} onPress={() => onAdd(concert)}>
            <Text style={styles.buttonText}>Ajouter à mes concerts</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden'
  },
  image: {
    height: 180,
    justifyContent: 'flex-end'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white'
  },
  text: {
    color: 'white'
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff5c5c',
    padding: 6,
    borderRadius: 5,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});