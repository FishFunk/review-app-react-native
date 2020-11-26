import { dbPlace } from "../models/place";
import { reviewSummary } from "../models/reviews";
import { appUser } from "../models/user";

export const isUserVerified = function(usr: appUser){
    return usr.email_verified && usr.phone_verified && usr.reviews && usr.reviews.length > 0;
}

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

export const getReviewAverages = (reviews: reviewSummary[]): {avgPrice: number, avgRating: number}=>{
    let avgPrice = 0;
    let avgRating = 0;

    if(reviews && reviews.length > 0){
        let priceSum = 0;
        let ratingSum = 0;

        for(let r of reviews){
            priceSum += r.pricing;
            ratingSum += r.avg_rating;
        }

        avgPrice = priceSum/reviews.length;
        avgRating = ratingSum/reviews.length;

        return { avgPrice: avgPrice, avgRating: avgRating};
    } else {
        return { avgPrice: 0, avgRating: 0};
    }
}

export const getPlaceAvgRating = function(
    dbPlace: dbPlace | null): number {
    let total = 0;

    if(dbPlace && dbPlace.reviews){
        let reviewKeys = Object.keys(dbPlace.reviews);
        let sum = 0;
        reviewKeys.forEach((key: string)=>{
            sum += dbPlace.reviews[key].avg_rating;
        });
            
        total = sum/reviewKeys.length;
    }

    return total;
}

export const getPlaceAvgPricing = function(
    dbPlace: dbPlace | null): number {
    let total = 0;

    if(dbPlace && dbPlace.reviews){
        let reviewKeys = Object.keys(dbPlace.reviews);
        let sum = 0;
        reviewKeys.forEach((key: string)=>{
            sum += dbPlace.reviews[key].pricing;
        });

        total = sum/reviewKeys.length;
    }

    return total;
}

const _toRad = function(val: number): number {
    return val * Math.PI / 180;
}