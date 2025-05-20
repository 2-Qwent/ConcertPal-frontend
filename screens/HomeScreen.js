import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Post from "../components/Post";
import moment from 'moment';


export default function HomeScreen({ navigation }) {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`http://192.168.1.183:3000/posts`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts);
      });
  }, []);

  const timeline = posts.map((data, i) => {
    return (
      <Post
        key={i}
        username={data.author.username}
        text={data.text}
        date={moment(data.date).fromNow()}
      />
    );
  });

  return (
    <View style={styles.container}>
      <Text>Feed</Text>
      {timeline}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
