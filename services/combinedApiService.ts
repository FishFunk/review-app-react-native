import _indexOf from 'lodash/indexOf';
import { yelpApiSearchByPhone, yelpApiBusinessMatch } from './yelpApiService';
import { getGooglePlaceById } from './googlePlaceApiService';

export const getApiPlaceSummary = async (apiKey: string, googlePlaceId: string)=> {
    
    const googlePlace = await getGooglePlaceById(apiKey, googlePlaceId, 
        ['name', 
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
        'user_ratings_total']);

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
            formatted_address: googlePlace.formatted_address,
            formatted_phone_number: googlePlace.formatted_phone_number,
            website: googlePlace.website,
            business_status: googlePlace.business_status,
            opening_hours: googlePlace.opening_hours,
            photos: googlePlace.photos,
            latlng: { latitude: googlePlace.geometry?.location.lat, longitude: googlePlace.geometry?.location.lng },
            name: googlePlace.name, 
            googleRating: googlePlace.rating, 
            googleCount: googlePlace.user_ratings_total,
            yelpRating: yelpPlace?.rating,
            yelpCount: yelpPlace?.review_count
        };

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