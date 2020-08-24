const prodConfig = {
    // only dev for now
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

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export default config;