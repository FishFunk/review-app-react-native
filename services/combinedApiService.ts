import _indexOf from 'lodash/indexOf';
import { yelpApiSearchByPhone, yelpApiBusinessMatch } from './yelpApiService';
import { getGooglePlaceById, getGooglePlaceListByQuery, getGooglePlaceListByType } from './googlePlaceApiService';
import { fullApiPlace, placeMarkerData } from '../models/place';

const defaultFields = ['name', 
'international_phone_number', 
'formatted_phone_number',
'address_components', 
'geometry', 
'rating', 
'formatted_address',
'business_status',
'opening_hours', 
'website',
'photos',
'user_ratings_total',
'icon',
'types'];

export const getApiPlaceSummary = async (apiKey: string, googlePlaceId: string): Promise<placeMarkerData | undefined>=> {
    const googlePlace = await getGooglePlaceById(apiKey, googlePlaceId, defaultFields);

    if(googlePlace){
        const yelpPlace = getYelpInfoFromGoogleResult(googlePlace);
        return createPlaceMarkerObject(googlePlace, yelpPlace);
    }
}

export const getNearbyPlaceSummariesByType = async (
    apiKey: string, lat: number, lng: number, 
    type: 'bar' | 'cafe' | 'tourist_attraction' | 'spa' | 
        'shopping_mall' | 'shoe_store' | 'restaurant' | 'park' | 'night_club'|
        'meal_delivery' | 'meal_takeaway' | 'lodging' | 'liquor_store' | 'pharmacy'): Promise<placeMarkerData[]>=> {
    
    let places = [];

    // const t0 = performance.now();
    const nearbyGooglePlaces = await getGooglePlaceListByType(apiKey, lat, lng, type, ['place_id']);
    // const t1 = performance.now();
    // console.log(`getGooglePlaceListByType took ${t1-t0} milliseconds`);

    if(nearbyGooglePlaces && nearbyGooglePlaces.length > 0){
        // Limit # of results for performance
        for(let i = 0; i < 6; i++){
            let googlePlace = nearbyGooglePlaces[i];
            if(googlePlace && googlePlace.place_id){
                
                // let t2 = performance.now();
                const fullGooglePlace = await getGooglePlaceById(apiKey, googlePlace.place_id, defaultFields);   
                // let t3 = performance.now();
                // console.log(`getGooglePlaceById took ${t3 - t2}`);

                const yelpData = await getYelpInfoFromGoogleResult(fullGooglePlace);
                // let t4 = performance.now();
                // console.log(`getYelpInfoFromGoogleResult took ${t4 - t3}`);

                const placeMarker = createPlaceMarkerObject(fullGooglePlace, yelpData);

                places.push(placeMarker);
            }
        }
        
        return places;
    } else {
        return [];
    }
}

export const getNearbyPlaceSummariesByQuery = async (apiKey: string, lat: number, lng: number, query: string): Promise<placeMarkerData[]>=> {
    let places = [];
    const nearbyGooglePlaces = await getGooglePlaceListByQuery(apiKey, lat, lng, query, defaultFields);

    if(nearbyGooglePlaces && nearbyGooglePlaces.length > 0){
        // Limit # of results for performance
        for(let i = 0; i < 6; i++){
            let googlePlace = nearbyGooglePlaces[i];
            if(googlePlace && googlePlace.place_id){
                const fullGooglePlace = await getGooglePlaceById(apiKey, googlePlace.place_id, defaultFields);
                const yelpData = await getYelpInfoFromGoogleResult(fullGooglePlace);
                const placeMarker = createPlaceMarkerObject(fullGooglePlace, yelpData);
                places.push(placeMarker);
            }
        }

        return places;
    } else {
        return [];
    }
}

const createPlaceMarkerObject = (googlePlace: fullApiPlace, yelpData: any): placeMarkerData => {
    const result = { 
        placeId: googlePlace.place_id,
        formatted_address: googlePlace.formatted_address,
        formatted_phone_number: googlePlace.formatted_phone_number,
        website: googlePlace.website,
        business_status: googlePlace.business_status,
        types: googlePlace.types,
        opening_hours: googlePlace.opening_hours,
        photos: googlePlace.photos,
        icon: googlePlace.icon,
        latlng: { latitude: googlePlace.geometry?.location.lat, longitude: googlePlace.geometry?.location.lng },
        title: googlePlace.name, 
        googleRating: googlePlace.rating, 
        googleCount: googlePlace.user_ratings_total,
        yelpRating: yelpData?.rating,
        yelpCount: yelpData?.review_count
    };

    return result;
}

const getYelpInfoFromGoogleResult = async (googlePlace: fullApiPlace) => {
    if(googlePlace.international_phone_number){
        const targetPhone = googlePlace.international_phone_number.replaceAll(' ', '').replaceAll('-', '');
        return await yelpApiSearchByPhone(targetPhone);
    } else if(googlePlace.address_components){
        // Search yelp by address components
        const components = getAddressComponents(googlePlace.address_components);
        if(googlePlace.name && 
            components.addr1 && 
            components.city && 
            components.stateCode && 
            components.countryCode)
            return await yelpApiBusinessMatch(
                googlePlace.name, components.addr1, components.city, components.stateCode, components.countryCode);
    }
}

const getAddressComponents = (addressComponents: any[]) => {
    let countryCode, city, stateCode, streetNumber, street;

    for(let item of addressComponents){
        for (let type of item.types){
            switch(type){
                case('country'):
                    countryCode = item.short_name;
                    break;
                case('street_number'):
                    streetNumber = item.long_name;
                    break;
                case('route'):
                    street = item.long_name;
                    break;
                case('administrative_area_level_1'): // state
                    stateCode = item.short_name;
                    break;
                case('locality'): // city
                    city = item.short_name;
                    break;
            }
        }
    }

    return { 
        addr1: `${streetNumber} ${street}`,
        city: city,
        stateCode: stateCode,
        countryCode: countryCode
    };
}