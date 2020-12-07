import _indexOf from 'lodash/indexOf';
import { yelpApiSearchByPhone, yelpApiBusinessMatch } from './yelpApiService';
import { getGooglePlaceById } from './googlePlaceApiService';

export const getApiPlaceSummary = async (apiKey: string, googlePlaceId: string)=> {
    const googlePlace = await getGooglePlaceById(apiKey, googlePlaceId, 
        ['name', 'international_phone_number', 'geometry', 'rating', 'address_components']);
    let yelpPlace;

    if(googlePlace){
        if(googlePlace.international_phone_number){
            const targetPhone = googlePlace.international_phone_number.replaceAll(' ', '').replaceAll('-', '');
            yelpPlace = await yelpApiSearchByPhone(targetPhone);
        } else {
            // Search yelp by address components
            const components = getAddressComponents(googlePlace.address_components);
            if(googlePlace.name && 
                components.addr1 && 
                components.city && 
                components.stateCode && 
                components.countryCode)
                yelpPlace = await yelpApiBusinessMatch(
                    googlePlace.name, components.addr1, components.city, components.stateCode, components.countryCode);
        }

        const result = { 
            placeId: googlePlaceId,
            latlng: { latitude: googlePlace.geometry?.location.lat, longitude: googlePlace.geometry?.location.lng },
            name: googlePlace?.name, 
            googleRating: googlePlace?.rating, 
            yelpRating: yelpPlace?.rating };

        console.log(result);
        return result;
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