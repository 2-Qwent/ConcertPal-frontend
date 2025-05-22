import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { user } from "../reducers/user";
import Concert from "../components/Concert";

const postsData = [
  {
    author: "John Doe",
    date: "20/05/2025",
    postBody: "Good concert",
  },
  {
    author: "John Doe",
    date: "20/05/2025",
    postBody: "Cannot wait to meet again",
  },
  {
    author: "John Doe",
    date: "20/05/2025",
    postBody: "I loved the show!",
  },
];
const mediaData = [
  require("../assets/placeholderConcertPics/20230826_220421.jpg"),
  require("../assets/placeholderConcertPics/20230826_220425.jpg"),
  require("../assets/placeholderConcertPics/20230826_224537.jpg"),
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("concerts");
  const [concerts, setConcerts] = useState([]);
  const [posts, setposts] = useState([]);
  const [activeUser, setActiveUser] = useState([]);
  const user = useSelector((state) => state.user.value);

  const token = user.token;

  useEffect(() => {
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/users/${token}`)
      .then((response) => response.json())
      .then((data) => {
        setposts(data.user.posts);
        setActiveUser(data.user);
      });
    fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/concerts/${token}`)
      .then((response) => response.json())
      .then((data) => {
        setConcerts(data.list);
      });
  }, []);

  const handleTabPress = (tabName) => {
    // console.log('I was clicked UwU');
    setActiveTab(tabName);
  };

  const userConcerts = concerts.map((data, i) => {
    return (
      <Concert
        key={i}
        pic={data.pic}
        city={data.city}
        venue={data.venue}
        artist={data.artist}
        date={data.date}
        screen="Profile"
      />
    );
    // return (
    //   <View key={i} style={styles.concert}>
    //     <View style={styles.concertContainerTop}>
    //       <FontAwesome name="star-o" size={25} color="#000000" />
    //       <Text>{data.artist}</Text>
    //       <Text>{data.date}</Text>
    //     </View>
    //     <Text>
    //       {data.venue} - {data.city}
    //     </Text>
    //   </View>
    // );
  });

  const userPosts = posts.map((data, i) => {
    return (
      <View key={i} style={styles.concert}>
        <View style={styles.concertContainerTop}>
          <Text>{data.author}</Text>
          <Text>{data.date}</Text>
        </View>
        <Text>{data.postBody}</Text>
      </View>
    );
  });

  const media = mediaData.map((data, i) => {
    return (
      <View key={i}>
        <Image source={data} style={styles.image} resizeMode="cover" />
      </View>
    );
  });

  return (
    <ImageBackground
      source={require("../assets/IMG_background.png")}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* ───── ⋆ ───── Top ───── ⋆ ───── */}
        <View style={styles.aboutUser}>
          <View style={styles.profilePic}>
            <FontAwesome name="user-circle" size={80} color="#000000" />
            <Text>placeholder</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{activeUser.username}</Text>
            <TouchableOpacity style={styles.button}>
              <Text>Modifier mon profil</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* ───── ⋆ ───── Content ───── ⋆ ───── */}
        <View style={styles.contentContainer}>
          {/* ───── ⋆ ───── Tabs ───── ⋆ ───── */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => handleTabPress("concerts")}
              style={styles.tab}
            >
              <Text>Concerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress("posts")}
              style={styles.tab}
            >
              <Text>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress("media")}
              style={styles.tab}
            >
              <Text>Media</Text>
            </TouchableOpacity>
          </View>
          {/* ───── ⋆ ───── Tab Content ───── ⋆ ───── */}
          <View style={styles.tabContent}>
            {activeTab === "concerts" && (
              <ScrollView>{userConcerts}</ScrollView>
            )}
            {activeTab === "posts" && userPosts}
            <View style={styles.mediaContainer}>
              {activeTab === "media" && media}
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  aboutUser: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profilePic: {
    width: "40%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    width: "60%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 20,
  },
  userName: {
    fontSize: 36,
  },
  button: {
    width: 200,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#E8EAED",
    borderWidth: 2,
    borderColor: "#A5ECC0",
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: "#E8EAED",
    width: "95%",
    height: "500",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7D7D7",
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
    paddingBottom: 15,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#D7D7D7",
  },
  tab: {
    width: 80,
    height: 50,
    color: "#E8EAED",
    backgroundColor: "#A5A7EC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  concert: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#D7D7D7",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15,
  },
  concertContainerTop: {
    width: "100%",
    // backgroundColor: 'aqua',
    height: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: 140,
    height: 140,
    margin: 10,
    borderRadius: 12,
  },
  mediaContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
  },
});
