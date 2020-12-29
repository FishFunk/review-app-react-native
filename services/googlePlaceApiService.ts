import { fullApiPlace, placeId } from '../models/place';

const baseUrl = 'https://maps.googleapis.com/maps/api/place';
const searchRadius = '1600'; // Search radius in meters

const _getPlaceUrl = (apiKey: string, place_id: string, fields?: Array<string>)=> {
    const urlExt = '/details/json?';
    const placeId = `place_id=${place_id}`;
    const fieldStr = fields ? `&fields=${fields.join(',')}` : '';
    return `${baseUrl}${urlExt}${placeId}${fieldStr}&key=${apiKey}`;
}

const _findPlaceFromTextUrl = (apiKey: string, searchQuery: string, 
    lat: number, lng: number, fields?: string[])=>{
    const urlExt = `/findplacefromtext/json?`;
    const biasParam = `&locationbias=point:${lat},${lng}`;
    const fieldsParam = fields ? `&fields=${fields.join(',')}` : '';
    return `${baseUrl}${urlExt}input=${searchQuery}&inputtype=textquery${biasParam}${fieldsParam}&key=${apiKey}`;
}

// // Note: API does not allow specifcying fields for nearby search
// const _findNearbyUrl = (
//         apiKey: string, 
//         lat: number, 
//         lng: number, 
//         type: string)=>{

//     const urlExt = '/nearbysearch/json?';
//     const location = `&location=${lat},${lng}`;
//     const radius = `&radius=${searchRadius}`;

//     return `${baseUrl}${urlExt}${location}${radius}&type=${type}&key=${apiKey}`;
// }

// Note: API does not allow specifcying fields for text search
const _findPlacesByTextSearchUrl = (
        apiKey: string, 
        lat: number, 
        lng: number, 
        query: string)=> {
    
    const urlExt = `/textsearch/json?`;
    const location = `&location=${lat},${lng}`;
    const radius = `&radius=${searchRadius}`;

    return  `${baseUrl}${urlExt}${location}${radius}&query=${query}&key=${apiKey}`;
}

export const getPhotoUrl = (apiKey: string,photoRef: string)=>{
    const url = 
        `${baseUrl}/photo?&maxwidth=300&photoreference=${photoRef}&key=${apiKey}`;
    return url;
}
  
export const getGooglePlaceById = (
    apiKey: string,
    place_id: string, 
    fields: Array<string>)=> {
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

export const getSingleGooglePlaceIdBySearch = (apiKey: string, searchQuery: string, lat: number, lng: number)=> {
    const url = _findPlaceFromTextUrl(apiKey, searchQuery, lat, lng, ['place_id']);

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

// Get nearby results by text query and location. Doesn't return full place details and fields cannot be specified.
export const getGooglePlaceListByQuery = async (
    apiKey: string,
    lat: number,
    lng: number,
    query: string): Promise<fullApiPlace[]> => {

    try{
        let url = _findPlacesByTextSearchUrl(apiKey, lat, lng, query);

        const response = await fetch(url);
        const json = await response.json();

        if(json.status === "OK" && json.results && json.results.length > 0){
            return json.results;
        } else {
            return Promise.reject("No matching places found");
        }
    } catch (ex){
        return Promise.reject(ex);
    }
}