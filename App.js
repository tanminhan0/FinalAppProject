import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View, Image,StyleSheet, TouchableOpacity } from 'react-native'
import { useState } from 'react'

const Stack = createNativeStackNavigator()

const profilePic = require('./assets/logo.png');

export default App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Home"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="ScheduleTimetable"
          component={ScheduleTimetableScreen}
          options={{ title: 'Scheduled Shifts' }}
        />
        {/* <Stack.Screen
          name="ScheduleOwnShifts"
          component={ScheduleOwnScreen}
          options={{ title: 'Scheduled Own Shifts' }}
        /> */}
        <Stack.Screen
          name="CheckIn"
          component={WorkCheckInScreen}
          options={{ title: 'Scheduled Own Shifts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workees</Text>
      <Image source={profilePic} style={styles.profilePic} />
      <Text style={styles.name}>TAN MIN HAN</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScheduleTimetable')}>
        <Text style={styles.buttonText}>View Scheduled Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScheduleOwnShifts')}>
        <Text style={styles.buttonText}>Schedule Your Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WorkCheckIn')}>
        <Text style={styles.buttonText}>Check In</Text>
      </TouchableOpacity>
    </View>
  )
}

const ScheduleTimetableScreen = () => {
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

const WorkCheckInScreen = () => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      // Upload image to server and save location and time
      // ...
      console.log("Image uploaded successfully.")
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Work Check-In</Text>
      {location && <Text style={styles.locationText}>{location.latitude}, {location.longitude}</Text>}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      <TouchableOpacity style={styles.button} onPress={() => takePicture()}>
        <Text style={styles.buttonText}>Take a Picture</Text>
      </TouchableOpacity>
    </View>
  )};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  title: {
    position: 'absolute',
    width: 128,
    height: 45,
    fontWeight:'bold',
    fontSize: 32,
    lineHeight:38,
    bottom:789,
    color:'#2D4059',
  },
  profilePic: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color:'#2D4059',
    
  },
  button: {
    backgroundColor: '#F07B3F',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
})
