export const getLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(
            (data)=>resolve(data.coords),
            (err) => reject(err)
        );
    });
}