import * as Location from 'expo-location';

export const getLocation = (): Promise<Location.LocationData> => {
    return new Promise(async (resolve, reject)=>{
        let response = await Location.requestPermissionsAsync().catch(error=>reject(error));
        if (response && response.status !== 'granted') {
          reject('Permission to access location was denied');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({}).catch(error=>reject(error));
        if(location) resolve(location);
    });
}