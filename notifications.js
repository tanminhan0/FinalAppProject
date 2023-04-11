import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowAlert: true,
      };
    },
  });

export function AddNotificationReceivedListener(){
    return Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('NOTIFICATION RECEIVED');
          console.log(notification);
          const userName = notification.request.content.data.userName;
          console.log(userName);
        }
      );
    }
export function AddNotificationResponseReceivedListener(){
    return Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('NOTIFICATION RESPONSE RECEIVED');
          console.log(response);
          const userName = response.notification.request.content.data.userName;
          console.log(userName);
        }
      );
}
  

export async function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
        content: {
        title: 'My first local notification',
        body: 'This is the body of the notification.',
        data: { userName: 'Max' },
        sound: ''
        },
        trigger: {
        seconds: 5,
        },
});
}

export function sendPushNotificationHandler(name) {
    fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        to: 'ExponentPushToken[1YEvCrMmUjr0FF8JftVEbd]', //ExponentPushToken[sZKvLIDYw_1SIyYgm9xYxD]
        title: name,
        body: 'Checked In Successfully!',
        })
});
}

export async function configurePushNotifications() {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (finalStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Push notifications need the appropriate permissions.'
      );
      return;
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    console.log(pushTokenData);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }