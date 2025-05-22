import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";

const postsData = [
  {
    author: "John Doe",
    date: "20/05/2025",
    postBody: "Good concert",
  },
  {
    author: "Jane Doe",
    date: "20/05/2025",
    postBody: "Cannot wait to meet again",
  },
  {
    author: "Lauren",
    date: "20/05/2025",
    postBody: "I loved the show!",
  },
];

export default function ConcertScreen({ route }) {
  const { artist, city, venue, seatmap, pic, date } = route.params;
  const formattedDate = moment(date).format("DD/MM/YYYY");

  const userPosts = postsData.map((data, i) => {
    return (
      <View style={styles.postWrapper} key={i}>
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
              width: '85%',
            }}>
            <Text>{data.author}</Text>
            <Text>{data.date}</Text>
          </View>
          <Text>{data.postBody}</Text>
        </View>
      </View>
    );
  });

  return (
    <ImageBackground
      source={require('../assets/IMG_background.png')}
      style={StyleSheet.absoluteFill}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.head}>
          {artist} - {venue} - {formattedDate}
        </Text>
        <Image style={styles.image} source={{ uri: seatmap }} />
        <View style={styles.wrapper}>{userPosts}</View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "95%",
    height:190,
    borderRadius: 12,
    marginBottom: 20,
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
  wrapper :{
    width: "90%",
    height: "55%",
    backgroundColor: "#E8EAED",
    borderRadius: 12,
    borderwidth: 2,
    borderColor: "#A5ECC0",
  },
  postWrapper: {
    flexDirection: 'row',
    padding: 20,
    borderBottomColor: '#A5ECC0',
    borderBottomWidth: 1,
  },
  profilePic: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
});