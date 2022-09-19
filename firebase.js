import {initializeApp} from 'firebase/app';
// import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth/react-native';

const firebaseConfig = {
    apiKey: "AIzaSyAjBy9phJjNnP0ZlSxnZ39A_ZiJ-7HyddY",
    authDomain: "forum-react-native.firebaseapp.com",
    projectId: "forum-react-native",
    storageBucket: "forum-react-native.appspot.com",
    messagingSenderId: "324622380026",
    appId: "1:324622380026:web:d82251f1564226f4f6d243"
};

// initialize firebase app
const app = initializeApp(firebaseConfig);

// initialize auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase
// const app = initializeApp(firebaseConfig)
// const auth = getAuth(app)
const database = getFirestore(app);
const storage = getStorage(app)

export { auth, database, storage }