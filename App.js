import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, Button, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app, database } from './firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [list, setList] = useState([]);
  const [values, loading, error] = useCollection(collection(database, "notes"));
  const data = values?.docs.map((doc) => ({...doc.data(), id:doc.id}))

  async function saveToFirebase(noteText) {
    try {
      await addDoc(collection(database, "notes"), {
        text: text
      });
      console.log("Note added to Firestore successfully!");
    } catch (error) {
      console.error("Error adding document to Firestore:", error);
    }
  }

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

  async function buttonHandler() {
    if (text.trim().length === 0) {
      return;
    }
  
    // Save the note to Firestore and get the document ID
    try {
      const docRef = await addDoc(collection(database, "notes"), {
        text: text
      });
  
      const newList = [...list, { key: docRef.id, value: text }];
      setList(newList);
      setText(''); 

      const jsonValue = JSON.stringify(newList);
      await AsyncStorage.setItem('@myList', jsonValue);
    } catch (error) {
      console.error("Error adding or saving", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [])
  ) 

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
          <TouchableOpacity 
            style={styles.noteTouchable} 
            onPress={() => navigation.navigate('Details', { key: item.key, value: item.value })}
            activeOpacity={0.6}
          >
            <Text style={styles.item}>
              {item.value.length > 50 ? `${item.value.substring(0,50)}...`:item.value}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { key, value } = route.params;
  const [text, setText] = useState(value);

  async function saveNote() {
    try {
      const jsonValue = await AsyncStorage.getItem('@myList');
      let list = jsonValue != null ? JSON.parse(jsonValue) : [];
      const updatedList = list.map(item => {
        if (item.key === key) {
          return { ...item, value: text };
        }
        return item;
      });
      const newJsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem('@myList', newJsonValue);

      // Update the note in Firestore
      const noteRef = doc(database, "notes", key); // Get a reference to the Firestore document
      await updateDoc(noteRef, { text: text }); // Update the document in Firestore
      console.log("Note updated in Firestore successfully");

      navigation.goBack();
    } catch (error) {
      // Error saving data
    }
  }

  async function deleteNote() {
    try {
      const jsonValue = await AsyncStorage.getItem('@myList');
      let list = jsonValue != null ? JSON.parse(jsonValue) : [];
      const filteredList = list.filter(item => item.key !== key); 
      const newJsonValue = JSON.stringify(filteredList);
      await AsyncStorage.setItem('@myList', newJsonValue);

      // Delete the note from Firestore
      await deleteDoc(doc(database, "notes", key));

      navigation.goBack(); 
    } catch (error) {
      // Error deleting data
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.noteTitle}>Note Details</Text>
      <TextInput
        style={styles.largeTextInput}
        onChangeText={setText}
        value={text}
        multiline={true}
      />
      <View style={styles.buttonContainer}>
        <Button title='Save Note' onPress={saveNote} />
        <Button title='Delete Note' onPress={deleteNote} /> 
      </View>
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
  largeTextInput: {
    minHeight: 100, 
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 20,
    marginTop: 20,
    padding: 10,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '80%', 
    marginBottom: 20, 
  },
  item: {
    padding: 2,
    fontSize: 13,
    height: 27,
    textAlign: 'center',
    alignSelf: 'center',
  },
  detailText: {
    fontSize: 13,
  },
  noteTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
  },
  noteTouchable: {
    backgroundColor: '#f0f0f0',
    paddingTop: 5, 
    paddingHorizontal: 5, 
    borderRadius: 5, 
    alignSelf: 'center', 
    marginBottom: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
});
