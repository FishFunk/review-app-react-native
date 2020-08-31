import * as Location from 'expo-location';
import { GOOGLE_API_KEY } from '../constants/Keys';
import { apiPlace } from '../models/place';

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

export const getPlacesUrl = (lat: number, lng: number, radius: number, type?: string)=> {
  const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
  const location = `location=${lat},${lng}&radius=${radius}`;
  const typeData = type ? `&types=${type}`: '';
  const api = `&key=${GOOGLE_API_KEY}`;
  return `${baseUrl}${location}${typeData}${api}`;
}

export const getGooglePlaces = (lat: number, lng: number, placeType: string = '')=> {
  const places = new Array<apiPlace>();
  const url = getPlacesUrl(lat, lng, 1500, placeType);

  console.log(url);

  return new Promise<Array<apiPlace>>((resolve, reject)=>{
    fetch(url)
    .then(res => res.json())
    .then(res => {
      res.results.map((element: any, index: number) => {
        const place = {
          id: element.place_id,
          name: element.name,
          photos: element.photos,
          rating: element.rating,
          vicinity: element.vicinity,
          latitude: element.geometry.location.lat,
          longitude: element.geometry.location.lng
        };

        places.push(place);
      });

      resolve(places);
    })
    .catch(error => reject(error));
  });

}