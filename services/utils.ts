import { dbPlace, openClosePeriod } from "../models/place";
import { reviewSummary } from "../models/reviews";
import { appUser } from "../models/user";

export const isUserVerified = function(usr: appUser){
    return usr.email_verified && usr.phone_verified && usr.reviews && usr.reviews.length > 0;
}

export const generateRandomString = function(){
    return Math.random().toString(20).substr(2, 8);
}

export const checkForOpenCloseHours = function(
    opening_hours: { open_now : boolean, periods: Array<openClosePeriod>}){

    if(!opening_hours){
        return null;
    }

    const today = new Date();
    const day = today.getDay();
    const military = getMilitaryTime(today);

    let result = {
        open_now: opening_hours && opening_hours.open_now,
        message: ''
    };
    
    for(let p of opening_hours.periods){
        if(p.open && p.open.day === day){
            if(military >= p.open.time){
                result.open_now = true;
                result.message = `Open ${getStandardTime(p.open.time)} - ${getStandardTime(p.close?.time)}`;
                break;
            }
            if((getMilitaryTime(addMinutesToDate(today, 45))) >= p.open.time){
                result.open_now = false;
                result.message = `Opening soon! Opens at ${getStandardTime(p.open.time)}`;
                break;
            }
        } else if(p.close && p.close.day === day){
            if(military >= p.close.time){
                result.open_now = false;
                result.message = `Closed. Hours are ${getStandardTime(p.open.time)} - ${getStandardTime(p.close?.time)}`;
                break;
            }
            if((getMilitaryTime(addMinutesToDate(today, 45))) >= p.close.time){
                result.open_now = true;
                result.message = `Closing soon! Hours are ${getStandardTime(p.open.time)} - ${getStandardTime(p.close?.time)}`;
                break;
            }
        }
    }

    return result;
}

const addMinutesToDate = function(now: Date, mins: number){
    const then = new Date();
    then.setTime(now.getTime() + (mins*60*1000));
    return then;
}

export const getMilitaryTime = function(time: Date){
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const convertedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const hourMinutes = +`${hours}${convertedMinutes}`;
    return hourMinutes;
}

export const getStandardTime = function(military: number){
    if(military == null){
        return '???';
    }

    const str = military.toString();
    if(str.length === 3){
        const hours = +str.slice(0,1);
        const mins = +str.slice(1);
        return `${hours}:${mins} AM`;
    } else if (str.length === 4){
        const hours = +str.slice(0,2);
        const amPm = hours >= 12 ? 'PM' : 'AM'
        return `${hours > 12 ? hours - 12 : hours}:${str.slice(2)} ${amPm}`;
    } else {
        throw new Error(`getStandardTime invalid param: ${military}`);
    }
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