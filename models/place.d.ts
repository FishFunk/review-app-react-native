export interface placeId {
  place_id: string
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
  formatted_address?: string,
  formatted_phone_number? : string,
  icon? : string,
  name? : string,
  opening_hours? : {
    open_now : boolean,
    periods: Array<any>
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

export interface markerData {
  latlng: {
    latitude: number,
    longitude: number
  },
  title: string,
  description?: string,
  rating?: number,
  icon?: string,
  placeId: string
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
  rating: number,
  pricing: number,
  formatted_address?: string,
  icon?: string,
  types?: string[]
}