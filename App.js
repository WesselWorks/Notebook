import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, FlatList, Text, Button, View, TextInput} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {

  const [text, setText] = useState('')
  const [list, setList] = useState([])

  async function saveList() {
    try {
      const jsonValue = JSON.stringify(list)
      await AsyncStorage.setItem('@myList', jsonValue)
    } catch (error) { }
  }

  async function loadList() {
    try {
      let jsonValue = await AsyncStorage.getItem('@myList')
      if (jsonValue != null) {
        const arr = JSON.parse(jsonValue)
        if (arr != null) { 
          setList(arr) 
        }
      }
    } catch (error) { }
  }


  function buttonHandler() {
    alert('You Typed: ' + text)
    setList(
      [...list, {key:list.length, value:text}]
      )
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} onChangeText={(text) => setText(text)}/>
      <Button title='Press Me' onPress={buttonHandler}></Button>
      <Button title='Save List' onPress={saveList}></Button>
      <Button title='Load List' onPress={loadList}></Button>

      <FlatList 
        data={list}
        renderItem={(note) => <Text>{note.item.value}</Text>}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 200
  },
  textInput: {
    backgroundColor: 'lightblue',
    minWidth: 200,
  }
});
