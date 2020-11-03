// **********
// Utility class for interfacing with local storage
// *********

class LocalStorageService {
    constructor(){
        if(!localStorage){
            throw new Error("Local storage is required for this app to run properly");
        }
    }

    clearAll(){
        localStorage.clear();
    }

    // Set a value into local storage
    setItem(key: string, value: string){
        if(typeof(key) === 'string' && typeof(value) === 'string'){
            localStorage.setItem(key, value);
        } else {
            throw new Error("Bad param types. Local storage accepts only string values");
        }
    }

    // Retrieve a stored value form local storage
    getItem(key: string){
        if(typeof(key) === 'string'){
            return localStorage.getItem(key);
        } else {
            throw new Error("Bad param types. Local storage accepts only string values");
        }
    }
}

const instance = new LocalStorageService();
export default instance;