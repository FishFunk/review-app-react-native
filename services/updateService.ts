import * as Updates from 'expo-updates';

export const checkForUpdates = async () => {
    if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // ... notify user of update ...
            console.log("App Updating...");
            await Updates.reloadAsync();
        }
    }
}
