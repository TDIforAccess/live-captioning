import * as firebase from "firebase";

const configProd = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID"
};

const configDev = {
  apiKey: "YOUR_DEV_API_KEY",
  authDomain: "YOUR_DEV_AUTH_DOMAIN",
  databaseURL: "YOUR_DEV_DATABASE_URL",
  projectId: "YOUR_DEV_PROJECT_ID",
  storageBucket: "",
  messagingSenderId: "YOUR_DEV_MESSAGING_SENDER_ID"
};

if (firebase.apps && !firebase.apps.length) {
  firebase.initializeApp(process.env.FIREBASE_ENV === "production" ? configProd : configDev);
}

export const firebaseAuth = firebase.auth();
export const fireStore = firebase.firestore();
export const realTimeDatabse = firebase.database();
export const cloudFunctions = firebase.functions();
