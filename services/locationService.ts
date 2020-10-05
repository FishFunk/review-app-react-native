import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export const getLocation = async (): Promise<Location.LocationData | null> => {
  try{
    const { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION);
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      finalStatus = status;
    }
  
    if(finalStatus !== 'granted') {
      return null;
    } else {
      const location = await Location.getCurrentPositionAsync({timeout: 2000});
      return location;
    }
  } catch (ex){
    console.error(ex);
    return null;
  }
}