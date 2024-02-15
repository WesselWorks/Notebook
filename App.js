import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, FlatList, Text, Button, View, TextInput, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [list, setList] = useState([]);

  async function saveList() {
    try {
      const jsonValue = JSON.stringify(list);
      await AsyncStorage.setItem('@myList', jsonValue);
    } catch (error) {
      // Error saving data
    }
  }

  async function loadList() {
    try {
      let jsonValue = await AsyncStorage.getItem('@myList');
      if (jsonValue != null) {
        setList(JSON.parse(jsonValue));
      }
    } catch (error) {
      // Error loading data
    }
  }

  function buttonHandler() {
    setList([...list, { key: String(list.length), value: text }]);
    setText(''); // Clear the input after adding
  }

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.textInput} 
        onChangeText={setText} 
        value={text}
        placeholder="Type here..."
      />
      <View style={styles.buttonContainer}>
        <Button title='Add Note' onPress={buttonHandler} />
        <Button title='Save List' onPress={saveList} />
        <Button title='Load List' onPress={loadList} />
      </View>
      <FlatList 
        data={list}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Details', { text: item.value })}>
            <Text style={styles.item}>{item.value}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function DetailsScreen({ route }) {
  const { text } = route.params;
  return (
    <View style={styles.container}>
      <Text>Details Screen</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 20,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row', // Aligns buttons horizontally
    justifyContent: 'space-between', // Distributes space evenly between the buttons
    width: '80%', // Adjust as necessary to fit your layout
    marginBottom: 20, // Adds some space below the buttons before the list
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  detailText: {
    marginTop: 20,
    fontSize: 24,
  },
});
