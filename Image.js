import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

export const ImgPicker = props => {
  const [pickedImage, setPickedImage] = useState();

  
  

  const verifyPermissions = async () => {
    const result = await Permissions.askAsync( Permissions.CAMERA_ROLL, Permissions.CAMERA)
    let succss = false
    if (result.status == 'granted') succss = true
    if(result.permissions )
    if(result.permissions.camera.status == 'granted') succss = true
    console.log('result: ' + JSON.stringify(result))
    if (result.status !== 'granted') {
      Alert.alert(
        'Insufficient permissions!',
        'You need to grant camera permissions to use this app.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }
    const image = await ImagePicker.launchCameraAsync({
      cameraType: 'front',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    });

   
    setPickedImage(image.uri);
    props.onImageCapture(image.uri);

  };

  return (
    <View style={styles.imagePicker}>
      <View style={styles.imagePreview}>
        {!pickedImage ? (
          <Text>No Image for Check-In yet.</Text>
        ) : (
          <Image style={styles.image} source={{ uri: pickedImage }} resizeMode="cover" />
        )}
      </View>
      <TouchableOpacity style={styles.checkInButton} onPress={() => takeImageHandler()}>
        <Text style={styles.buttonText}>Take a Picture</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '80%',
    height: 200,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1, 
    borderRadius: 10, 
  },
  image: {
    width: '100%', // fill the container
    height: '100%',
    borderRadius: 10,
  },
  checkInButton: {
    backgroundColor: '#F07B3F',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    minWidth: 160, 
    alignItems: 'center', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default ImgPicker;