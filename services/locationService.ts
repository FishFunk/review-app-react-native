import * as Location from 'expo-location';

export const getLocation = (): Promise<Location.LocationData> => {
    return new Promise(async (resolve, reject)=>{
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          reject('Permission to access location was denied');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        resolve(location);
    });
}