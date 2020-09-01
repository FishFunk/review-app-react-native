import * as Contacts from 'expo-contacts';

export const getContacts = (): Promise<Contacts.Contact[]> => {
    return new Promise((resolve, reject)=>{
        Contacts.getContactsAsync({ 
            fields: [
                Contacts.Fields.FirstName,
                Contacts.Fields.LastName,
                Contacts.Fields.Emails, 
                Contacts.Fields.PhoneNumbers
            ]})
        .then(response =>{
            resolve(response.data);
        })
        .catch(error => reject(error));
    })

    
}

export const requestContactsPermission = (): Promise<boolean> => {
    return new Promise(async (resolve, reject)=>{
        const { status } = await Contacts.requestPermissionsAsync();
        resolve(status === Contacts.PermissionStatus.GRANTED)
    });
}


export const checkContactsPermission = (): Promise<boolean> => {
    return new Promise(async (resolve, reject)=>{
        const { status } = await Contacts.getPermissionsAsync();
        resolve(status === Contacts.PermissionStatus.GRANTED)
    });
}
