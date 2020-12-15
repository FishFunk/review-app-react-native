import { fullApiPlace, placeId } from '../models/place';

const baseUrl = 'https://maps.googleapis.com/maps/api/place';

const _getPlaceUrl = (apiKey: string, place_id: string, fields?: Array<string>)=> {
    const urlExt = '/details/json?';
    const placeId = `place_id=${place_id}`;
    const fieldStr = fields ? `&fields=${fields.join(',')}` : '';
    return `${baseUrl}${urlExt}${placeId}${fieldStr}&key=${apiKey}`;
}

const _findPlaceUrl = (apiKey: string, searchQuery: string)=>{
    const urlExt = `/findplacefromtext/json?`;
    return `${baseUrl}${urlExt}input=${searchQuery}&inputtype=textquery&key=${apiKey}`;
}

const _findNearbyUrl = (
        apiKey: string, 
        lat: number, 
        lng: number, 
        type: string,
        fields?: string[])=>{

    const urlExt = '/nearbysearch/json?';
    const location = `&location=${lat},${lng}`;
    const radius = `&radius=2000`; // Radius in meters
    const fieldStr = fields ? `&fields=${fields.join(',')}` : '';

    return `${baseUrl}${urlExt}${location}${radius}${fieldStr}&type=${type}&key=${apiKey}`;
}

const _findPlacesByTextUrl = (
        apiKey: string, 
        lat: number, 
        lng: number, 
        query: string,
        fields?: string[])=> {
    
    const urlExt = `/textsearch/json?`;
    const location = `&location=${lat},${lng}`;
    const radius = `&radius=2000`; // Radius in meters
    const fieldStr = fields ? `&fields=${fields.join(',')}` : '';

    return  `${baseUrl}${urlExt}${location}${radius}${fieldStr}&query=${query}&key=${apiKey}`;
}

// const _fetchNextPage = async (pageToken: string, apiKey: string) => {
//     const url = `${baseUrl}/nearbysearch/json?pagetoken=${pageToken}&key=${apiKey}`;
//     const response = await fetch(url);
//     const json = await response.json();

//     if(json.status === "OK" && json.results && json.results.length > 0){
//         return json.results;
//     } else {
//         return Promise.reject("No matching places found");
//     }
// }

export const getPhotoUrl = (apiKey: string,photoRef: string)=>{
    const url = 
        `${baseUrl}/photo?&maxwidth=300&photoreference=${photoRef}&key=${apiKey}`;
    return url;
}
  
export const getGooglePlaceById = (
    apiKey: string,
    place_id: string, 
    fields: Array<string> = ['business_status', 'geometry', 'name', 'icon',
        'opening_hours', 'photos', 'place_id', 'website', 'formatted_phone_number', 
        'formatted_address', 'types'])=> {
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


// Get nearby results by type. Doesn't return full places details
export const getGooglePlaceListByType = async (
        apiKey: string,
        lat: number,
        lng: number,
        type: 'bar' | 'cafe' | 'tourist_attraction' | 'spa' | 
            'shopping_mall' | 'shoe_store' | 'restaurant' | 'park' | 'night_club'|
            'meal_delivery' | 'meal_takeaway' | 'lodging' | 'liquor_store' | 'pharmacy' | 'hair_care',
        fields?: string[]): Promise<fullApiPlace[]> => {

    try{
        let url = _findNearbyUrl(apiKey, lat, lng, type, fields);

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

// Get nearby results by text query. Doesn't return full places details
export const getGooglePlaceListByQuery = async (
    apiKey: string,
    lat: number,
    lng: number,
    query: string,
    fields?: string[]): Promise<fullApiPlace[]> => {

    try{
        let url = _findPlacesByTextUrl(apiKey, lat, lng, query, fields);

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