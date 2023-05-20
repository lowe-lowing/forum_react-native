import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjBy9phJjNnP0ZlSxnZ39A_ZiJ-7HyddY",
  authDomain: "forum-react-native.firebaseapp.com",
  projectId: "forum-react-native",
  storageBucket: "forum-react-native.appspot.com",
  messagingSenderId: "324622380026",
  appId: "1:324622380026:web:d82251f1564226f4f6d243",
};

// initialize firebase app
const app = initializeApp(firebaseConfig);

// initialize auth
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// Initialize Firebase
// const app = initializeApp(firebaseConfig)
const auth = getAuth(app);
// connectAuthEmulator(auth, "http://localhost:9099");
// const database = getFirestore(app);

// firebaseApps previously initialized using initializeApp()
const database = getFirestore(app);
// connectFirestoreEmulator(database, "localhost", 8080);

const storage = getStorage(app);
// connectStorageEmulator(storage, "localhost", 8080);

export { auth, database, storage };
