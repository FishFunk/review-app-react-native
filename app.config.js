
export default ({ config }) => {
  if(config.releaseChannel === 'production'){
    config.android.googleServicesFile = './firebase_prod_configs/google-services.json';
    config.ios.googleServicesFile = './firebase_prod_configs/GoogleService-Info.plist';
  }

  return config;
};