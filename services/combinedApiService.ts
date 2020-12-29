import _indexOf from 'lodash/indexOf';
import { yelpApiSearchByPhone, yelpApiBusinessMatch } from './yelpApiService';
import { getGooglePlaceById, getGooglePlaceListByQuery } from './googlePlaceApiService';
import { fullApiPlace, placeMarkerData } from '../models/place';
import LocalStorageService from '../services/localStorageService';
import { GOOGLE_API_RESULTS_KEY, GOOGLE_API_RESULTS_INDEX_KEY } from '../constants/AsyncStorage';
import { defaultGoogleApiFields } from '../constants/Various';

export const getApiPlaceSummary = async (apiKey: string, googlePlaceId: string): Promise<placeMarkerData | undefined>=> {
    const googlePlace = await getGooglePlaceById(apiKey, googlePlaceId, defaultGoogleApiFields);

    if(googlePlace){
        const yelpPlace = await _getYelpInfoFromGoogleResult(googlePlace);
        return _createPlaceMarkerObject(googlePlace, yelpPlace);
    }
}

export const createPlaceMarkerObjectFromGooglePlace = async (googlePlace: fullApiPlace): Promise<placeMarkerData> => {
    const yelpPlace = await _getYelpInfoFromGoogleResult(googlePlace);
    return _createPlaceMarkerObject(googlePlace, yelpPlace);
}

export const getNearbyPlaceSummariesByQuery = async (apiKey: string, lat: number, lng: number, query: string): Promise<placeMarkerData[]>=> {
    const nearbyGooglePlaces = await getGooglePlaceListByQuery(apiKey, lat, lng, query);
    await LocalStorageService.setItem(GOOGLE_API_RESULTS_KEY, nearbyGooglePlaces);
    await LocalStorageService.setItem(GOOGLE_API_RESULTS_INDEX_KEY, 4);
    return _iterateAndConvertNearbyPlaceResults(apiKey, nearbyGooglePlaces, 5);
}

export const loadMoreResults = async (apiKey: string) => {
    const nearbyGooglePlaces = await LocalStorageService.getItem(GOOGLE_API_RESULTS_KEY);
    const idx = await LocalStorageService.getItem(GOOGLE_API_RESULTS_INDEX_KEY);
    return _iterateAndConvertNearbyPlaceResults(apiKey, nearbyGooglePlaces, 5, idx);
}

const _iterateAndConvertNearbyPlaceResults = 
    async (apiKey: string, nearbyGooglePlaces: fullApiPlace[], count: number, startIndex: number = 0)=>{
    let places = [];

    if(startIndex > 20 || count < 1 || count > 10){
        throw new Error('iterateAndConvertNearbyPlaceResults - count param is outside acceptable range (1-10)');
    }

    await LocalStorageService.setItem(GOOGLE_API_RESULTS_INDEX_KEY, startIndex + count);

    if(nearbyGooglePlaces && nearbyGooglePlaces.length > 0){
        // Limit # of results for performance
        for(let i = startIndex; i < (startIndex + count); i++){
            let googlePlace = nearbyGooglePlaces[i];
            if(googlePlace && googlePlace.place_id){
                // TODO: Don't want to fetch data we've already fetched. Merge results?
                const apiGooglePlace = await getGooglePlaceById(apiKey, googlePlace.place_id, defaultGoogleApiFields);
                const yelpData = await _getYelpInfoFromGoogleResult(apiGooglePlace);
                const placeMarker = _createPlaceMarkerObject(apiGooglePlace, yelpData);
                places.push(placeMarker);
            }
        }

        return places;
    } else {
        return [];
    }
}

const _createPlaceMarkerObject = (googlePlace: fullApiPlace, yelpData: any): placeMarkerData => {
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
        googleRating: googlePlace.rating ? googlePlace.rating : 0, 
        googleCount: googlePlace.user_ratings_total ? googlePlace.user_ratings_total : 0,
        yelpRating: yelpData && yelpData.rating ? yelpData.rating : 0,
        yelpCount: yelpData && yelpData.review_count ? yelpData.review_count  : 0
    };

    return result;
}

const _getYelpInfoFromGoogleResult = async (googlePlace: fullApiPlace) => {
    if(googlePlace.international_phone_number){
        const targetPhone = googlePlace.international_phone_number.replaceAll(' ', '').replaceAll('-', '');
        return await yelpApiSearchByPhone(targetPhone);
    } else if(googlePlace.address_components){
        // Search yelp by address components
        const components = _getAddressComponents(googlePlace.address_components);
        if(googlePlace.name && 
            components.addr1 && 
            components.city && 
            components.stateCode && 
            components.countryCode)
            return await yelpApiBusinessMatch(
                googlePlace.name, components.addr1, components.city, components.stateCode, components.countryCode);
    }
}

const _getAddressComponents = (addressComponents: any[]) => {
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