
export default ({ config }) => {
  if(config.extra.releaseChannel === 'production'){
    config.android.googleServicesFile = './firebase_prod_configs/google-services.json';
    config.ios.googleServicesFile = './firebase_prod_configs/GoogleService-Info.plist';
    config.ios.config.googleMapsApiKey = "AIzaSyCuSqRG35ES9EG8EOxcVVafP4MkmnB7F80";
    config.ios.config.googleSignIn.reservedClientId = "com.googleusercontent.apps.997182803601-h1273nbi2ocfbqmoo4cu4mck1b96ueev";
    config.extra.iosClientId = "997182803601-h1273nbi2ocfbqmoo4cu4mck1b96ueev.apps.googleusercontent.com"
  }

  return config;
};