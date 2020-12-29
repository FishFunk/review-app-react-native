import * as Updates from 'expo-updates';

export const checkForUpdates = async () => {
    if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        }
    }
}
