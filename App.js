import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the stack navigator
const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home"
          component={Home} 
        />
        <Stack.Screen 
          name="Details"
          component={Details}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

}


const Home = ({ navigation, route }) => {

  function goToDetailPage() {
    navigation.navigate('Details');
  }

  return (
    <View style={styles.container}>
      <Text>Welcome To Home Screen</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details')}/>
    </View> 
  );

}

const Details = ({ navigation, route }) => {

  function goToHomePage() {
    navigation.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <Text>Details Screen</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')}/>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center', 
  }
});
