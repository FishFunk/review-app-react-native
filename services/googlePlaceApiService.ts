import { GOOGLE_API_KEY } from '../constants/Keys';
import { fullApiPlace, placeId } from '../models/place';

const baseUrl = 'https://maps.googleapis.com/maps/api/place';

const getPlaceUrl = (place_id: string, fields?: Array<string>)=> {
    const urlExt = '/details/json?';
    const placeId = `place_id=${place_id}`;
    const fieldStr = fields ? `&fields=${fields.join(',')}` : ''
    return `${baseUrl}${urlExt}${placeId}${fieldStr}&key=${GOOGLE_API_KEY}`;
}

const findPlaceUrl = (searchQuery: string)=>{
    const urlExt = `/findplacefromtext/json?`;
    return `${baseUrl}${urlExt}input=${searchQuery}&inputtype=textquery&key=${GOOGLE_API_KEY}`;
}
  
export const getGooglePlaceById = (
    place_id: string, 
    fields: Array<string> = ['business_status', 'geometry', 'name', 
        'opening_hours', 'photos', 'place_id', 'website'])=> {
    const url = getPlaceUrl(place_id, fields);

    console.log(url);

    return new Promise<fullApiPlace>((resolve, reject)=>{
        fetch(url)
        .then(res => res.json())
        .then(res => {
            resolve(res.result);
        })
        .catch(error => reject(error));
});
}

export const getGooglePlaceIdBySearch = (searchQuery: string, fields?: Array<string>)=> {
    const url = findPlaceUrl(searchQuery);

    console.log(url);

    return new Promise<placeId>((resolve, reject)=>{
        fetch(url)
        .then(res => res.json())
        .then(res => {
            if(res.status === "OK" && res.candidates && res.candidates.length > 0){
                resolve(res.candidates[0]);
            } else {
                reject("No matching places found");
            }
        })
        .catch(error => reject(error));
    });
}