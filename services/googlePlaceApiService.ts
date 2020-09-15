import { fullApiPlace, placeId } from '../models/place';

const baseUrl = 'https://maps.googleapis.com/maps/api/place';

const _getPlaceUrl = (apiKey: string, place_id: string, fields?: Array<string>)=> {
    const urlExt = '/details/json?';
    const placeId = `place_id=${place_id}`;
    const fieldStr = fields ? `&fields=${fields.join(',')}` : ''
    return `${baseUrl}${urlExt}${placeId}${fieldStr}&key=${apiKey}`;
}

const _findPlaceUrl = (apiKey: string, searchQuery: string)=>{
    const urlExt = `/findplacefromtext/json?`;
    return `${baseUrl}${urlExt}input=${searchQuery}&inputtype=textquery&key=${apiKey}`;
}

export const getPhotoUrl = (apiKey: string,photoRef: string)=>{
    const url = 
        `${baseUrl}/photo?&maxwidth=400&photoreference=${photoRef}&key=${apiKey}`;
    return url;
}
  
export const getGooglePlaceById = (
    apiKey: string,
    place_id: string, 
    fields: Array<string> = ['business_status', 'geometry', 'name', 
        'opening_hours', 'photos', 'place_id', 'website', 'formatted_phone_number', 'types'])=> {
    const url = _getPlaceUrl(apiKey, place_id, fields);

    return new Promise<fullApiPlace>((resolve, reject)=>{
        fetch(url)
        .then(res => res.json())
        .then(res => {
            if(res.result){
                resolve(res.result);
            } else {
                reject(new Error("getGooglePlaceById returned no results"));
            }
        })
        .catch(error => reject(error));
});
}

export const getGooglePlaceIdBySearch = (apiKey: string, searchQuery: string)=> {
    const url = _findPlaceUrl(apiKey, searchQuery);

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