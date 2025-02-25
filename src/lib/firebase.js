import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDNyqlzqWKI5sLuTLh2lTT8eTM03FtRHIY",
    authDomain: "hjira-cbcc7.firebaseapp.com",
    projectId: "hjira-cbcc7",
    storageBucket: "hjira-cbcc7.appspot.com",
    messagingSenderId: "553395993370",
    appId: "1:553395993370:web:912af2d00c708ab6c50aa3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
