import _first from 'lodash/first';

// TODO: Make new app build to use app config value
// import appConfig from '../app.json';
//appConfig.expo.extra.yelpApiBearerToken

const baseUrl = 'https://api.yelp.com/v3/businesses/';
const headers = new Headers();
headers.set('Authorization', 'Bearer en2ZVirgzxSZUqzj4aBO1Rj1bvAdXnNuul3LW6cFdTHXe6pjn2Mu8LJAVUQnDMqVq0u3MFth4QpVyS-1X5gA2rCkajArCO-S79Er7gvsn7HjD6k32wZKgx7QlNPLX3Yx');

// Phone format +14159083801
export const yelpApiSearchByPhone = async (phone: string)=>{
    const response = await fetch(`${baseUrl}search/phone?phone=${phone}`, { headers: headers });
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


// This endpoint lets you match business data from other sources against businesses on Yelp, 
// based on provided business information.
export const yelpApiBusinessMatch = async (name: string, address1: string, city: string, stateCode: string, countryCode: string)=>{
    const params = `name=${name}&address1=${address1}&city=${city}&state=${stateCode}&country=${countryCode}`;
    const response = await fetch(`${baseUrl}matches?${params}`, { headers: headers });
    const json = await response.json();
    const bizMatch = json.businesses ? _first(json.businesses) : null;
    if(bizMatch && bizMatch.id){
        const biz = await yelpApiBusinessById(bizMatch.id);
        return biz;
    }
}

export const yelpApiBusinessById = async(id: string)=>{
    const response = await fetch(`${baseUrl}${id}`, { headers: headers });
    const json = await response.json();
    return json;
}
