import { dbPlace } from "../models/place";

export const generateRandomString = function(){
    return Math.random().toString(20).substr(2, 8);
}

export const isInRadius = function(
    centerLat: number, 
    centerLng: number, 
    targetLat: number, 
    targetLng: number, 
    desiredRadiusKm: number): boolean{
    var R = 6371; // km
    var dLat = _toRad(targetLat-centerLat);
    var dLon = _toRad(targetLng-centerLng);
    var lat1 = _toRad(centerLat);
    var lat2 = _toRad(targetLat);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var distance = R * c;

    return distance <= desiredRadiusKm;
}

export const getPlaceAvgRating = function(
    dbPlace: dbPlace | null): number {
    let total = 0;
    // If there are relevant reviews, calculate average rating
    if(dbPlace?.reviews && dbPlace?.reviews.length > 0){
        let sum = 0;
        for(let r of dbPlace?.reviews){
            sum += r.avg_rating;
        }
        total = sum/dbPlace?.reviews.length;
    }

    return total;
}

export const getPlaceAvgPricing = function(
    dbPlace: dbPlace | null): number {
    let total = 0;
    // If there are relevant reviews, calculate average rating
    if(dbPlace?.reviews && dbPlace?.reviews.length > 0){
        let sum = 0;
        for(let r of dbPlace?.reviews){
            sum += r.pricing;
        }
        total = sum/dbPlace?.reviews.length;
    }

    return total;
}

const _toRad = function(val: number): number {
    return val * Math.PI / 180;
}