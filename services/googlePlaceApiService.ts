import { GOOGLE_API_KEY } from '../constants/Keys';
import { fullApiPlace, placeId } from '../models/place';

const baseUrl = 'https://maps.googleapis.com/maps/api/place';

const _getPlaceUrl = (place_id: string, fields?: Array<string>)=> {
    const urlExt = '/details/json?';
    const placeId = `place_id=${place_id}`;
    const fieldStr = fields ? `&fields=${fields.join(',')}` : ''
    return `${baseUrl}${urlExt}${placeId}${fieldStr}&key=${GOOGLE_API_KEY}`;
}

const _findPlaceUrl = (searchQuery: string)=>{
    const urlExt = `/findplacefromtext/json?`;
    return `${baseUrl}${urlExt}input=${searchQuery}&inputtype=textquery&key=${GOOGLE_API_KEY}`;
}

export const getPhotoUrl = (photoRef: string)=>{
    const url = 
        `${baseUrl}/photo?&maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
    return url;
}
  
export const getGooglePlaceById = (
    place_id: string, 
    fields: Array<string> = ['business_status', 'geometry', 'name', 
        'opening_hours', 'photos', 'place_id', 'website', 'formatted_phone_number', 'types'])=> {
    const url = _getPlaceUrl(place_id, fields);

    return new Promise<fullApiPlace>((resolve, reject)=>{
        fetch(url)
        .then(res => res.json())
        .then(res => {
            resolve(res.result);
        })
        .catch(error => reject(error));
});
}

export const getGooglePlaceIdBySearch = (searchQuery: string)=> {
    const url = _findPlaceUrl(searchQuery);

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