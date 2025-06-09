import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addConcert, removeConcert } from "../reducers/concerts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useNavigation } from '@react-navigation/native';

export default function Concert(props) {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.value);
  const concerts = useSelector((state) => state.concerts.value);
  const dispatch = useDispatch();

  const onAdd = (props) => {
    // Vérifie si le concert est déjà dans le reducer (par exemple via artist, venue, date)
    const alreadyExists = concerts.some(
      c =>
        c.artist === props.artist &&
        c.venue === props.venue &&
        c.date === props.date
    );

    if (alreadyExists) {
      alert("Ce concert est déjà dans vos concerts !");
      return;
    }

    fetch(
      `https://concert-pal-backend.vercel.app/concerts/add/${user.token}`,
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
          dispatch(addConcert({ ...props, id: data.id }));
        } else {
          alert("Erreur lors de l'ajout du concert");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du concert :", error);
      });
  };

  const handlePress = () => {
    props.screen !== 'Home' &&
      navigation.navigate('ConcertScreen', {
        artist: props.artist,
        date: props.date,
        venue: props.venue,
        city: props.city,
        pic: props.pic,
        seatmap: props.seatmap,
        concertId: props.id,
      });
  }

  const onDelete = (props) => {
    fetch(`https://concert-pal-backend.vercel.app/concerts/delete/${user.token}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concertId: props.id }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          alert("Concert supprimé de mes concerts");
          dispatch(removeConcert(props.id));
        } else {
          alert("Erreur lors de la suppression du concert");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression du concert :", error);
      });
  }

  const formattedDate = moment(props.date).format("DD/MM/YYYY");

  return (
    <View style={styles.card}>
      {props.screen === 'Profile' &&
        <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <TouchableOpacity onPress={() => onDelete(props)}>
            <FontAwesome name="trash" size={22} color="#ff5c5c" />
          </TouchableOpacity>
        </View>
      }
      <Image source={props.seatmap} />
      <TouchableOpacity onPress={() => handlePress(props)}>
        <ImageBackground
          source={{ uri: props.pic }}
          style={styles.image}
          imageStyle={{ borderRadius: 10 }}>
          <View style={styles.overlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5, }}>
              <FontAwesome style={{ marginRight: 10 }} name="star-o" size={25} color="#565656" />
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
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
    backgroundColor: '#A5A7EC',
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
