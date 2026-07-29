import { auth, db } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const button = document.getElementById("loginButton");
const error = document.getElementById("error");

onAuthStateChanged(auth, async (user) => {

    if (user) {

        await loadUserRole(user.uid);
        location.href = "home.html";

    }

});

button.addEventListener("click", () => {

    signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
    )

    .then(async (credential) => {

        await loadUserRole(credential.user.uid);
        location.href = "home.html";

    })

    .catch(() => {

        error.textContent = "Email ou senha incorretos.";

    });

});

async function loadUserRole(uid) {

    console.log("UID:", uid);

    const userRef = doc(db, "Users", uid);
    const userSnap = await getDoc(userRef);

    console.log("Documento existe?", userSnap.exists());

    if (userSnap.exists()) {

        const role = userSnap.data().role;

        console.log("Role encontrada:", role);

        localStorage.setItem("role", role);

    }

}