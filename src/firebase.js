import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUE_VQZqRxlMRo5NijkMqqLdQvQ_I4bw4",
  authDomain: "fir-306d3.firebaseapp.com",
  projectId: "fir-306d3",
  storageBucket: "fir-306d3.appspot.com",
  messagingSenderId: "33985002461",
  appId: "1:33985002461:web:f06fb08943f0c59cca1434",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
