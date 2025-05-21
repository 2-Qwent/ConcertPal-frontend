import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";

export default function Concert(props) {
  const user = useSelector((state) => state.user.value);

  const onAdd = (props) => {
    fetch(
      `http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/add/${user.token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          alert("Concert ajouté à mes concerts");
        } else {
          alert("Erreur lors de l'ajout du concert");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du concert :", error);
      });
  };

  const handlePress = (props) => {
    console.log(props);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => handlePress(props)}>
        <ImageBackground
          source={{ uri: props.pic }}
          style={styles.image}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>{props.artist}</Text>
            <Text style={styles.text}>
              {props.venue} - {props.city}
            </Text>
            <Text style={styles.text}>{props.date}</Text>
            {props.screen === "Home" && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => onAdd(props)}
              >
                <Text style={styles.buttonText}>Ajouter à mes concerts</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  text: {
    color: "white",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#ff5c5c",
    padding: 6,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
