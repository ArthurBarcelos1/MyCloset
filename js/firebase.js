import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC3-axGXRN6gGI85PWaShfJufYF975Kdoo",
    authDomain: "mycloset-ff54c.firebaseapp.com",
    projectId: "mycloset-ff54c",
    storageBucket: "mycloset-ff54c.firebasestorage.app",
    messagingSenderId: "803476015918",
    appId: "1:803476015918:web:1fd7bbce7c3c5aa85488bf",
    measurementId: "G-ET86V8L956"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);