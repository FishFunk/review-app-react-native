import { dbPlace, openClosePeriod } from "../models/place";
import { reviewSummary } from "../models/reviews";
import { appUser } from "../models/user";

export default class Utils {
    static isUserVerified(usr: appUser){
        return usr.email_verified && usr.phone_verified && usr.reviews && usr.reviews.length > 0;
    }

    static generateRandomString(){
        return Math.random().toString(20).substr(2, 8);
    }

    static checkForOpenCloseHours(opening_hours: { open_now : boolean, periods: Array<openClosePeriod>}){
        if(!opening_hours){
            return null;
        }
    
        let result = {
            open_now: opening_hours && opening_hours.open_now,
            message: ''
        };
        
        if(opening_hours.periods){
            const today = new Date();
            const day = today.getDay();
            const military = this.getMilitaryTime(today);

            for(let p of opening_hours.periods){
                if(p.open && p.close && p.open.day === day){
                    if(military < p.close.time && (this.getMilitaryTime(this.addMinutesToDate(today, 45))) >= p.close.time){
                        result.open_now = true;
                        result.message = `Closing soon! Hours are ${this.getStandardTime(p.open.time)} - ${this.getStandardTime(p.close?.time)}`;
                    }
                    else if(military >= p.open.time && military < p.close.time){
                        result.open_now = true;
                        result.message = `Open ${this.getStandardTime(p.open.time)} - ${this.getStandardTime(p.close?.time)}`;
                    }
                    else if(military < p.open.time && (this.getMilitaryTime(this.addMinutesToDate(today, 45))) >= p.open.time){
                        result.open_now = false;
                        result.message = `Opening soon! Opens at ${this.getStandardTime(p.open.time)}`;
                    }
                    else if(military >= p.close.time){
                        result.open_now = false;
                        result.message = `Closed. Hours are ${this.getStandardTime(p.open.time)} - ${this.getStandardTime(p.close?.time)}`;
                    }
                }
            }
        }
    
        return result;
    }

    static addMinutesToDate(now: Date, mins: number){
        const then = new Date();
        then.setTime(now.getTime() + (mins*60*1000));
        return then;
    }

    static getMilitaryTime(time: Date){
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const convertedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const hourMinutes = +`${hours}${convertedMinutes}`;
        return hourMinutes;
    }

    static getStandardTime(military: number){
        if(military == null){
            return '???';
        }
    
        const str = military.toString();
        if(str.length === 3){
            const hours = str.slice(0,1);
            const mins = str.slice(1);
            return `${hours}:${mins} AM`;
        } else if (str.length === 4){
            const hours = +str.slice(0,2);
            const amPm = hours >= 12 ? 'PM' : 'AM'
            return `${hours > 12 ? hours - 12 : hours}:${str.slice(2)} ${amPm}`;
        } else {
            throw new Error(`getStandardTime invalid param: ${military}`);
        }
    }

    static isInRadius(
        centerLat: number, 
        centerLng: number, 
        targetLat: number, 
        targetLng: number, 
        desiredRadiusKm: number): boolean{
        var R = 6371; // km
        var dLat = this.toRad(targetLat-centerLat);
        var dLon = this.toRad(targetLng-centerLng);
        var lat1 = this.toRad(centerLat);
        var lat2 = this.toRad(targetLat);
    
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var distance = R * c;
    
        return distance <= desiredRadiusKm;
    }

    static getReviewAverages(reviews: reviewSummary[]): {avgPrice: number, avgRating: number}{
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
    
    static getPlaceAvgRating(dbPlace: dbPlace | null): number {
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
    
    static getPlaceAvgPricing(dbPlace: dbPlace | null): number {
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

    static toRad = function(val: number): number {
        return val * Math.PI / 180;
    }
}