import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addConcert } from "../reducers/concerts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";

export default function Concert(props) {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

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
          dispatch(addConcert(props));
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

  const formattedDate = moment(props.date).format("DD/MM/YYYY");

  return (
    <View style={styles.card}>
      <Image source={props.seatmap}/>
      <TouchableOpacity onPress={() => handlePress(props)}>
        <ImageBackground
          source={{ uri: props.pic }}
          style={styles.image}
          imageStyle={{ borderRadius: 12 }}>
          <View style={styles.overlay}>
            <View style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 5, }}>
              <FontAwesome style={{ marginRight: 10 }} name="star-o" size={25} color="#565656"/>
              <View>
                <Text style={styles.title}>{props.artist}</Text>
                <Text style={[styles.text, { fontSize: 12, marginBottom: 10, marginLeft: 10 }]}>{formattedDate}</Text>
              </View>
            </View>
            <Text style={[styles.text, { marginLeft: 10 }]}>
              {props.venue} - {props.city}
            </Text>
            {props.screen === 'Home' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => onAdd(props)}>
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
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#A5ECC0",
  },
  image: {
    height: 180,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#565656',
    marginLeft: 5,
  },
  text: {
    color: '#565656',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff5c5c',
    padding: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  concert: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    backgroundColor: 'red',
    borderRadius: 12,
  },
  concertContainerTop: {
    width: '300',
    // backgroundColor: 'aqua',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  artistName: {
    backgroundColor: 'aqua',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    margin: 5,
  },
});
