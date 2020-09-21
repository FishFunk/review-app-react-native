import { Share } from 'react-native';

export const openShareSheet = async (url: string, msg: string)=> {
        try {
            const result = await Share.share({
                url: url,
                message: msg
            }, {
                excludedActivityTypes: [
                    'com.apple.UIKit.activity.AddToReadingList',
                    'com.apple.reminders.RemindersEditorExtension']
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }

        } catch (error) {
            return Promise.reject(error.message);
        }

}