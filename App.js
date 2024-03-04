import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, FlatList, Text, Button, View, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app, database, storage } from './firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


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
    }
  }

  async function loadList() {
    try {
      let jsonValue = await AsyncStorage.getItem('@myList');
      if (jsonValue != null) {
        setList(JSON.parse(jsonValue));
      }
    } catch (error) {
    }
  }

  async function addNote() {
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
        <Button title='Add Note' onPress={addNote} />
        {/* <Button title='Save List' onPress={saveList} />
        <Button title='Load List' onPress={loadList} /> */}
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
  const [imagePath, setImagePath] = useState(null)

  async function getImage() {
    const resultat = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    })
    if(!resultat.canceled){
      console.log(`Det hentede billede er: `+ resultat)
      setImagePath(resultat.assets[0].uri)
    }
  }

  async function uploadImage() {
    if (imagePath && key) { 
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      const filename = `${key}.jpg`; 
      
      const storageRef = ref(storage, filename);
      uploadBytes(storageRef, blob).then(() => {
        console.log("Image uploaded with the note's ID as filename");
      }).catch((error) => {
        console.error("Upload failed", error);
      });
    }
  }

  async function downloadImage() {
    await getDownloadURL(ref(storage, `${key}.jpg`))
    .then((url) => {
      setImagePath(url)
    })
  }

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
      const noteRef = doc(database, "notes", key);
      await updateDoc(noteRef, { text: text }); 
      console.log("Note updated in Firestore successfully");

      navigation.goBack();
    } catch (error) {
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
        <Button title="Choose Image" onPress={getImage} />
        <Button title="Upload Image" onPress={uploadImage} />
        <Button title="Download Image" onPress={downloadImage} /> 
      </View>
      <Image source={{uri: imagePath}} style={{width: 200, height: 200}} />
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: 60, 
  },
  textInput: {
    height: 50, 
    borderColor: '#E5E7EB', 
    borderWidth: 1,
    borderRadius: 12, 
    width: '90%', 
    marginBottom: 20,
    padding: 15, 
    fontSize: 16, 
    backgroundColor: '#FFFFFF',
  },
  largeTextInput: {
    minHeight: 120, 
    borderColor: '#E5E7EB',
    borderWidth: 1,
    width: '90%',
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20,
    padding: 15,
    fontSize: 16, 
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '90%', 
    marginBottom: 20, 
  },
  item: {
    fontSize: 16, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    width: '90%', 
    marginVertical: 5, 
    textAlign: 'left', 
    alignSelf: 'center', 
  },
  noteTitle: {
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
  },
  noteTouchable: {
    backgroundColor: '#FFFFFF', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: '#E5E7EB', 
    alignSelf: 'center', 
    marginBottom: 20, 
    width: '100%', 
    shadowColor: "#000", 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2, 
  },
});