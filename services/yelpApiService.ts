import _first from 'lodash/first';
import appConfig from '../app.json';

const baseUrl = 'https://api.yelp.com/v3/businesses/';
const headers = new Headers();
headers.set('Authorization', appConfig.expo.extra.yelpApiBearerToken);

// Phone format +14159083801
export const yelpApiSearchByPhone = async (phone: string)=>{
    const response = await fetch(`${baseUrl}search/phone?phone=${phone}`, { headers: headers })
    const json = await response.json();
    return json.businesses ? _first(json.businesses) : null;
}

// Search term eg. "food", "restaurants", etc.
export const yelpApiSearchRadius = async (lat: number, lng: number, radius: number = 10, searchTerm?: string)=>{
    const latLngParams = `latitude=${lat}&longitude=${lng}`;
    const radiusParam = `&radius=${radius}`;
    const searchParam = searchTerm ? `$&term=${searchTerm}` : '';

    const response = await fetch(`${baseUrl}search?${latLngParams}${radiusParam}${searchParam}`, { headers: headers })
    const json = await response.json();
}


//This endpoint lets you match business data from other sources against businesses on Yelp, 
// based on provided business information. For example, if you know a business's exact address 
// and name, and you want to find that business and only that business on Yelp.
export const yelpApiBusinessMatch = async (name: string, address1: string, city: string, stateCode: string, countryCode: string)=>{
    const params = `name=${name}&address1=${address1}&city=${city}&state=${stateCode}&country=${countryCode}`;
    const response = await fetch(`${baseUrl}search/mathces?${params}`, { headers: headers })
    const json = await response.json();
    return json.businesses ? _first(json.businesses) : null;
}
