import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { isDevice } from 'expo-device';
import { Platform } from "react-native";

export const registerForPushNotificationsAsync = async () => {
    let result;
    if (isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if(finalStatus !== 'granted') {
        return { status: 'Failed to get push token for push notification!' };
      }

      const token = await Notifications.getExpoPushTokenAsync();
      result = { status: 'success', token: token };

    } else {
      console.warn(`Notifications do not work on emulators`);
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return result;
};