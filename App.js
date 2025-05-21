import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MessagesScreen from'./screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {updateToken, login, logout} from "./reducers/user";

const store = configureStore({
    reducer: { updateToken, login, logout },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = '';

        if (route.name === 'Profile') {
          iconName = 'user-circle';
        } else if (route.name === 'Messages') {
          iconName = 'envelope';
        } else if (route.name === 'Home') {
          iconName = 'home';
        }

        return <FontAwesome name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ec6e5b',
      tabBarInactiveTintColor: '#335561',
      headerShown: false,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}