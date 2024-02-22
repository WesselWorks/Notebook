// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA27xZkCZhUkOU_vfh0AAGnYuJECoaeWso",
  authDomain: "myproject-5a05b.firebaseapp.com",
  projectId: "myproject-5a05b",
  storageBucket: "myproject-5a05b.appspot.com",
  messagingSenderId: "777984493756",
  appId: "1:777984493756:web:a9388a9ed3d50596dca8b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

export { app, database }

