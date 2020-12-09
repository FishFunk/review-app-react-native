import { dbReview } from "./reviews";

export interface placeId {
  place_id: string
}

export interface period {
  day: number,
  time: number
}

export interface openClosePeriod {
  open: period,
  close: period
}

export interface placeByQuery {
  candidates: placeId[],
  status: string
}

export interface searchPlace {
    result: {
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        },
        viewport: {
          northeast: {
            lat: number;
            lng: number;
          },
          southwest: {
            lat: number;
            lng: number;
          }
        }
      },
      name: string;
    },
    status: string;
}

export interface apiPlace {
  latitude: number,
  longitude: number,
  name: string,
  photos?: Array<placePhoto>
  rating?: number,
  vicinity?: string
}

export interface fullApiPlace {
  business_status? : 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | null,
  geometry? : {
    location : {
        lat : number,
        lng : number
    },
    viewport : {
        northeast : {
          lat : number,
          lng : number
        },
        southwest : {
          lat : number,
          lng : number
        }
    }
  },
  address_components: any[],
  formatted_address?: string,
  formatted_phone_number? : string,
  international_phone_number?: string,
  icon? : string,
  name? : string,
  opening_hours? : {
    open_now : boolean,
    periods: Array<openClosePeriod>
  },
  photos? : Array<placePhoto>,
  place_id? : string,
  plus_code? : Object,
  rating? : number,
  reference? : string,
  scope? : string,
  types? : Array<string>,
  user_ratings_total? : number,
  website?: string,
  vicinity? : string
}

export interface placeMarkerData {
  placeId: string,
  latlng: {
    latitude: number,
    longitude: number
  },
  title: string,
  description?: string,
  formatted_address?: string,
  business_status?: string,
  opening_hours?: { open_now : boolean, periods: Array<openClosePeriod> },
  photos?: any[],
  rating?: number,
  pricing?: number,
  icon?: string,
  googleRating?: number,
  googleCount?: number,
  yelpRating?: number,
  yelpCount?: number,
  website?: string
}

export interface placePhoto {
  height: number,
  html_attributions: Array<string>
  photo_reference: string,
  width: number
}

export interface dbPlace {
  id: string,
  name: string,
  lat: number,
  lng: number,
  reviews: Object<string, dbReview>,
  formatted_address?: string,
  icon?: string,
  types?: string[]
}