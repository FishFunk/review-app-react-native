import AsyncStorage from '@react-native-async-storage/async-storage';

// **********
// Utility class for interfacing with local storage
// *********

class LocalStorageService {

    async clearAll(){
        return AsyncStorage.clear();
    }

    // Set a value into local storage
    async setItem(key: string, value: string | Object){
        if(typeof(key) !== 'string'){
            throw new Error("Key value must be a string!");
        }

        try {
            let jsonValue;
            if(typeof(value) === 'string'){
                jsonValue = value;
            } else {
                jsonValue = JSON.stringify(value);
            }
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error(e);
        }
    }

    // Retrieve a stored value form local storage
    async getItem(key: string){
        if(typeof(key) !== 'string'){
            throw new Error("Key value must be a string!");
        }

        let data;
        let jsonValue = await AsyncStorage.getItem(key);
        // Try parse
        try{
            data = jsonValue ? JSON.parse(jsonValue) : null;
        } catch (ex){
            // Not parsable
            data = jsonValue;
        }
        
        return data;
    }
}

const instance = new LocalStorageService();
export default instance;