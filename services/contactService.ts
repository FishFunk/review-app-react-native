import * as Contacts from 'expo-contacts';

export const getContactsPermission = (): Promise<any> => {
    return new Promise(async (resolve, reject)=>{
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            Contacts.getContactsAsync({ fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers] }).then(data=> {
                resolve(data);
            })
            .catch(error => reject(error));
        } else {
            reject("Contacts permission denied");
        }
    });
}

