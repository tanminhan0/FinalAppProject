import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native'
import { useState, useEffect } from 'react'
import ImgPicker from './Image'
import { sendPushNotificationHandler, AddNotificationReceivedListener, AddNotificationResponseReceivedListener, configurePushNotifications } from './notifications'
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';


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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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

      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ViewShift')}>
        <Text style={styles.buttonText}>View Scheduled Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ScheduleShift')}>
        <Text style={styles.buttonText}>Schedule Shifts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('CheckIn')}>
        <Text style={styles.buttonText}>Check In</Text>
      </TouchableOpacity>
    </View>
  )
}

const ViewScreen = () => {
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const [editShift, setEditShift] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    // Fetch scheduled shifts from database and update state
    viewAPI();
  }, []);

  const viewAPI = async () => {

    try {
      const res = await fetch(
        `https://cd11-193-1-57-1.ngrok-free.app/scheduledshifts`,
        {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "69420"
          },

        }
      );
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setScheduledShifts(data.shifts);
      } else {
        console.log('Failed to fetch scheduled shifts');
      }
    } catch (err) {
      console.log(err);
    }
  }

  const deleteAPI = async (id) => {
    try {
      const res = await fetch(
        `https://cd11-193-1-57-1.ngrok-free.app/deleteShift`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify(
            {
              _id: id,
            }),
        }
      );
      const data = await res.json();
      console.log("Deleted Schedule" + data);
    } catch (err) {
      console.log(err);
    }
  }

  const updateAPI = async (shift) => {
    try {
      const res = await fetch(
        `https://cd11-193-1-57-1.ngrok-free.app/updateShift`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify(shift),
        }
      );
      const data = await res.text();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePressShift = (item) => {
    // set editShift to the selected shift for editing
    setEditShift(item);
    setShowStartDatePicker(item.startTime);
    setShowEndDatePicker(item.endTime);
  }

  const handleEditShift = () => {
    // update scheduledShifts with the edited shift
    const updatedScheduledShifts = scheduledShifts.map((shift) => {
      if (shift._id === editShift._id) {
        const updatedShift = { ...shift };
        updatedShift.startTime = startDate;
        updatedShift.endTime = endDate;
        updateAPI(updatedShift);
       
        return updatedShift;
      }
      return shift;
    });
    setScheduledShifts(updatedScheduledShifts);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setEditShift(null);
  }

  const handleDeleteShift = (item) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedScheduledShifts = scheduledShifts.filter(
              (shift) => shift._id !== item._id
            );
            setScheduledShifts(updatedScheduledShifts);
            deleteAPI(item._id);
          },
        },
      ],
      { cancelable: false }
    );
  }

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

  const handleDateTimePickerCancel = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setEditShift(null);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduled Shifts</Text>
      {scheduledShifts.length > 0 ? (
        <FlatList
          scrollEnabled={false} // add scrollEnabled prop
          data={scheduledShifts}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.shiftContainer}
              onPress={() => {
                // handle press on shift functionality
                console.log("Shift pressed: ", item._id);
                handlePressShift(item)
              }}
            >
              <View style={styles.shiftInfo}>
                <Text style={styles.shiftDate}>{moment(item.startTime).format('dddd MMMM D')}</Text>
                <Text style={styles.shiftTime}>{moment(item.startTime).format('h:mm A')} - {moment(item.endTime).format('h:mm A')}</Text>
              </View>
              <View style={styles.shiftActions}>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteShift(item)}
                >
                  <Text style={styles.shiftButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
          <Text style={styles.noShiftsText}>No scheduled shifts found</Text>
        )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          is24Hour={true}
          display="default"
          style={{ position: 'absolute', alignSelf:'center', bottom: 160 }}
          onChange={handleStartDateChange}
          onCancel={handleDateTimePickerCancel}
        />
        
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          is24Hour={true}
          display="default"
          style={{ position: 'absolute', alignSelf:'center', bottom: 120 }}
          onChange={handleEndDateChange}
          onCancel={handleDateTimePickerCancel}
        />
        
      )}
      {editShift && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditShift}>
          <Text style={styles.editButtonText}>Edit Shift</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
//------------------------------------------------------------------------

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
    Alert.alert(
      'Scheduled Shift!!',
      'Your shifts is scheduled successfully!'
    );
    try {
      const res = await fetch(
        `https://cd11-193-1-57-1.ngrok-free.app/scheduleShift`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420"
          },
          body: JSON.stringify(
            {
              startTime: startDate,
              endTime: endDate
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
      <Text style={styles.title}>Workees</Text>
      <Text style={styles.scheduleTitle}>Schedule Your Shifts!</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={showStartDatepicker}>
        <Text style={styles.datePickerButtonText}>Start Date: {startDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker value={startDate} mode='datetime' is24Hour={true} minuteInterval={30}
          display='default' onChange={handleStartDateChange} />
      )}
      <TouchableOpacity style={styles.datePickerButton} onPress={showEndDatepicker}>
        <Text style={styles.datePickerButtonText}>End Date: {endDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker value={endDate} mode='datetime' is24Hour={true} minuteInterval={30}
          display='default' onChange={handleEndDateChange} />
      )}
      <TouchableOpacity style={styles.scheduleButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};


const WorkCheckInScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkInButtonDisabled, setCheckInButtonDisabled] = useState(true);
  const [pickedImage, setPickedImage] = useState();


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

    })();
  }, []);
  
  
  const handleImageCapture = (imageUri) => {
    setCheckInButtonDisabled(!imageUri);
    setPickedImage(imageUri);
  };

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

      const response = await fetch('https://cd11-193-1-57-1.ngrok-free.app/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkInTime: new Date().toISOString(),
          lat: location.coords.latitude,
          long: location.coords.longitude,
          image: pickedImage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
  
      Alert.alert('Check-in successful', 'Your check-in has been recorded.', [{ text: 'OK' }]);
      console.log('Checked in at', location.coords.latitude, location.coords.longitude);
      sendPushNotificationHandler('Conor');

    } catch (error) {
      setLocation(null);
      setErrorMsg(error.message);
      setCheckInTime(null);
      console.error(error);
      Alert.alert('Error', 'Failed to check-in. Please try again.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-In</Text>
      <ImgPicker onImageCapture={handleImageCapture} />
      
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {checkInTime && <Text style={styles.timeText}>Checked in at: {checkInTime}</Text>}
      {location && (
        <Text style={styles.locationText}>
          Location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
      <View style={styles.checkInButtonContainer}>
        <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}   disabled={checkInButtonDisabled}>
          <Text style={styles.checkInText}>Check In</Text>
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
    flex: 1,
    position: 'absolute',
    height: 45,
    fontWeight: 'bold',
    fontSize: 32,
    lineHeight: 38,
    bottom: 789,
    color: '#2D4059',
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
    color: '#2D4059',

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
  locationTitle: {
    fontSize: 16,
    marginVertical: 10,
    position: 'absolute',
    bottom: 150,
  },
  locationText: {
    fontSize: 10,
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
    backgroundColor: '#F07B3F',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    minWidth: 160,
    alignItems: 'center', 
  },
  checkInText:{
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',

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
  //Profile Screen

  profileButton: {
    backgroundColor: '#F07B3F',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },

  //ScheduleShift
  scheduleContainer: {
    alignItems: 'center',
    padding: 20,
  },
  scheduleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#2D4059',
  },
  scheduleButton: {
    backgroundColor: '#F07B3F',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },

  //ViewShift
  day: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    marginBottom: 5,
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shiftContainer: {
    width: '78%', // Set the width of the shift container to be 90% of the screen
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 20,
    top: 180,
    left: 30,
  },

  shiftButtonText: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',

  },
  editButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00bfff',
    bottom: 80,
    alignSelf: 'center',
  },

})
