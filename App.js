import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Image, Animated } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomTabBar, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import MessagesScreen from "./screens/MessagesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ConcertScreen from './screens/ConcertScreen.js';
import ChatScreen from './screens/ChatScreen.js';
import UserProfileScreen from './screens/UserProfileScreen.js';
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import user from "./reducers/user";
import concerts from "./reducers/concerts";
import post from "./reducers/post";
import following from "./reducers/following";
import { useState, useEffect, useRef } from 'react';

const reducers = combineReducers({ user, concerts, post, following });

const persistConfig = {
  key: "ConcertPal",
  storage: AsyncStorage,
};

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);
export {persistor}

const TabNavigator = () => {
  const [animationStart, setAnimationStart] = useState(false); //Etat pour le déclenchement de l'animation
  const [isReallyVisible, setIsReallyVisible] = useState(true); //Etat pour l'affichage de la tab bar
  const tabBarTranslateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animationStart) {
      //Masque la tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsReallyVisible(false));
    } else {
      //Affiche la tab bar
      setIsReallyVisible(true);
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(); 
    }
  }, [animationStart]);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = "";

            if (route.name === "Profile") {
              iconName = "user-circle";
            } else if (route.name === "Messages") {
              iconName = "envelope";
            } else if (route.name === "Home") {
              iconName = "home";
            }

            return (
              <View
                style={[
                  styles.tab,
                  { backgroundColor: focused ? "#E2A5EC" : "#A5ECC0" },
                ]}
              >
                <FontAwesome name={iconName} size={30} color="#fff" />
              </View>
            );
          },
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
        })}
        tabBar={(props) =>
          isReallyVisible && (
            <Animated.View
              style={[
                styles.tabBarStyle,
                {
                  transform: [{ translateY: tabBarTranslateY }],
                },
              ]}
            >
              <BottomTabBar {...props} />
            </Animated.View>
          )
        }
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen}/>
      </Tab.Navigator>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: isReallyVisible ? 100 : 0, // pour laisser de l’espace quand tab bar visible
          padding: 10,
          borderRadius: 30,
          bottom: 40,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        onPress={() => setAnimationStart((prev) => !prev)}
      >
        <FontAwesome name={isReallyVisible ? 'chevron-down' : 'chevron-up'} size={25} color="#a5ecc0" />
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="ConcertScreen" component={ConcertScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  tab: {
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 20,
  },
  tabBarStyle: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    backgroundColor: 'rgb(245, 245, 245)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});