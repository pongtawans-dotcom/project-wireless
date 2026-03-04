import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "API_KEY_ของคุณ",
  authDomain: "PROJECT_ID.firebaseapp.com",
  databaseURL: "https://group3-project-wireless-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);