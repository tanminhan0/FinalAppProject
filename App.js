import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View, Image,StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useState, useEffect } from 'react'
import ImgPicker from './Image'
import {sendPushNotificationHandler,AddNotificationReceivedListener, AddNotificationResponseReceivedListener, configurePushNotifications } from './notifications'
import * as Location from 'expo-location';

const Stack = createNativeStackNavigator()

const profilePic = require('./assets/icon.png');

export default App = () => {

  useEffect(() => {

    configurePushNotifications();
  }, []);

  
  useEffect(() => {
    const subscription1 = AddNotificationReceivedListener()
    const subscription2 = AddNotificationResponseReceivedListener()

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);
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

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CheckIn')}>
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
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

    })();
  }, []);

  const handleCheckIn = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setCheckInTime(new Date().toLocaleString());
      console.log('Checked in at', location.coords.latitude, location.coords.longitude);
      Alert.alert(
        'Check In Successfully!',
        'Checked in with location and time!'
      );
      sendPushNotificationHandler('Conor');

    } catch (error) {
      setLocation(null);
      setErrorMsg(error.message);
      setCheckInTime(null);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-In</Text>
      <ImgPicker />
      {location && (
        <Text style={styles.locationText}>
          {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {checkInTime && <Text style={styles.timeText}>Checked in at: {checkInTime}</Text>}
      <View style={styles.checkInButtonContainer}>
        <TouchableOpacity onPress={handleCheckIn}>
          <Text style={styles.checkInButton}>Check In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  title: {
    position: 'absolute',
    width: 150,
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
  locationText: {
    fontSize: 16,
    marginVertical: 10,
    position: 'absolute',
    bottom: 150,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginVertical: 10,
    position: 'absolute',
    bottom: 120
  },
  timeText: {
    fontSize: 16,
    marginVertical: 10,
    position: 'absolute',
    bottom: 100,
  },
  checkInButtonContainer: {
    position: 'absolute',
    bottom: 200,
  },
  checkInButton: {
    backgroundColor: 'lightpink',
    color: 'white',
    padding: 12,
    borderRadius: 8,
  },
})
