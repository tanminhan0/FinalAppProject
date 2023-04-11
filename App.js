import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View, Image,StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native'
import { useState, useEffect } from 'react'
import ImgPicker from './Image'
import {sendPushNotificationHandler,AddNotificationReceivedListener, AddNotificationResponseReceivedListener, configurePushNotifications } from './notifications'
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';


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
          name="ViewShift"
          component={ViewScreen}
          options={{ title: 'View Shifts' }}
        />
        <Stack.Screen
          name="ScheduleShift"
          component={ScheduleScreen}
          options={{ title: 'Scheduled Own Shifts' }}
        />
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

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ViewShift')}>
        <Text style={styles.buttonText}>View Scheduled Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScheduleShift')}>
        <Text style={styles.buttonText}>Schedule Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CheckIn')}>
        <Text style={styles.buttonText}>Check In</Text>
      </TouchableOpacity>
    </View>
  )
}

const ViewScreen = () => {
  const [scheduledShifts, setScheduledShifts] = useState([]);

  useEffect(() => {
    // Fetch scheduled shifts from database and update state
    fetch('/scheduledShifts')
      .then(response => response.json())
      .then(data => setScheduledShifts(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduled Shifts</Text>
      {scheduledShifts.length > 0 ? (
        <FlatList
          data={scheduledShifts}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.shiftContainer}>
              <Text style={styles.shiftTitle}>Shift {item._id}</Text>
              <Text style={styles.shiftText}>Start Time: {item.startTime}</Text>
              <Text style={styles.shiftText}>End Time: {item.endTime}</Text>
              <Text style={styles.shiftText}>Employees: {item.employees.join(', ')}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noShiftsText}>No scheduled shifts found</Text>
      )}
    </View>
  );
};


const ScheduleScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const showStartDatepicker = () => {
    setShowStartDatePicker(true);
  };

  const showEndDatepicker = () => {
    setShowEndDatePicker(true);
  };
 
  const handleSubmit = async () => {
    console.log(startDate)
    console.log(endDate)
    try {
      const res = await fetch(
        `https://1aa2-193-1-57-1.ngrok-free.app/scheduleShift`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify(
            {
              startTime: startDate.toISOString(),
              endTime: endDate.toISOString()
            }
          )
        }
      );
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Shifts</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={showStartDatepicker}>
        <Text style={styles.datePickerButtonText}>Start Date: {startDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker value={startDate} mode='datetime' is24Hour={true} display='default' onChange={handleStartDateChange} />
      )}
      <TouchableOpacity style={styles.datePickerButton} onPress={showEndDatepicker}>
        <Text style={styles.datePickerButtonText}>End Date: {endDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker value={endDate} mode='datetime' is24Hour={true} display='default' onChange={handleEndDateChange} />
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
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
    flex:1,
    position: 'absolute',
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
  datePickerButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 30,
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  submitButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00bfff',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  //ViewShift
  shiftContainer: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  shiftTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shiftText: {
    fontSize: 16,
    marginBottom: 3,
  },
  noShiftsText: {
    fontSize: 18,
    fontStyle: 'italic',
  },
})
