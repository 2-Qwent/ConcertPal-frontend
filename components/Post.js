import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux'

export default function Post(props) {

  const user = useSelector((state) => state.user.value)
  const token = user.token
  
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text>{props.username}</Text>
        <Text>{props.date}</Text>
      </View>
      <Text>{props.text}</Text>
      <View style={styles.icones}>
        <TouchableOpacity>
          <FontAwesome name="reply" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="heart" />
        </TouchableOpacity>
        <Text>likes</Text>
        <TouchableOpacity>
          <FontAwesome name="trash" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: "black",
    borderWidth: 1,
    width: "80%",
    height: 100,
  },
  info: {
    flex: 1,
    flexDirection: "row",
  },
  icones: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'flex-end',
    marginBottom: 5,
  },
});
