// import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'
import {useState} from 'react'

const Stack = createNativeStackNavigator()

export default App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen
          name="Fetch"
          component={FetchScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const HomeScreen = ({ navigation }) => {
  return (
    <Button
      title="Go to Fetch Screen"
      onPress={() => navigation.navigate('Fetch')
      }
    />
  )
}

const FetchScreen = ({ navigation }) => {
  const [text, setText] = useState('. . . waiting for fetch API')

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://a04a-193-1-57-1.eu.ngrok.io`,
        {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "69420"
          },
        }
      );
      const data = await res.json();
      console.log(data);
      setText(JSON.stringify(data))
    } catch (err) {
      console.log(err);
    }
  }

  return (
  <View>
    <Text>{text}</Text>
    <Button
      title="Go Fetch Some Quotes" onPress={async () => callAPI()}
    />
  </View>
  )
};