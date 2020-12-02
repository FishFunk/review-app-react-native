import Constants from "expo-constants";
import appConfig from "../app.json";

const prodConfig = {
  apiKey: "AIzaSyCuSqRG35ES9EG8EOxcVVafP4MkmnB7F80",
  authDomain: "nobullreviews-prod.firebaseapp.com",
  databaseURL: "https://nobullreviews-prod.firebaseio.com",
  projectId: "nobullreviews-prod",
  storageBucket: "nobullreviews-prod.appspot.com",
  messagingSenderId: "997182803601",
  appId: "1:997182803601:web:f7454ec528a426fc5f7930",
  measurementId: "G-KQBWJXKNDM"
};

const devConfig = {
    apiKey: "AIzaSyDobz23IU0wHUTYVHp3rfMCQ4mzlBWscrE",
    authDomain: "reviewers-dev.firebaseapp.com",
    databaseURL: "https://reviewers-dev.firebaseio.com",
    projectId: "reviewers-dev",
    storageBucket: "reviewers-dev.appspot.com",
    messagingSenderId: "111193503088",
    appId: "1:111193503088:web:f605f4f7f81a2d73c70bb5",
    measurementId: "G-SVFJ2NRX7H"
};

const env = Constants.manifest.releaseChannel;
const rc = appConfig.expo.extra.releaseChannel;

export default function getConfig(){
  if(rc === 'production' && env && env.indexOf('prod') > -1){
    return prodConfig;
  } else {
    return devConfig;
  }
}