import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQQh1XsrjgCsxCPhZoj8rIFZhjiO8IazI",
  authDomain: "saakshy-app-3e523.firebaseapp.com",
  projectId: "saakshy-app-3e523",
  storageBucket: "saakshy-app-3e523.firebasestorage.app",
  messagingSenderId: "268456607973",
  appId: "1:268456607973:web:a4eaa126ba1411c4cf140c",
  measurementId: "G-XV09BSWKKH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;
