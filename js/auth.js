import { auth } from "./firebase.js";
import {

    signInWithEmailAndPassword,
    onAuthStateChanged

}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const email=document.getElementById("email");
const password=document.getElementById("password");
const button=document.getElementById("loginButton");
const error=document.getElementById("error");
import { db, doc, getDoc } from "./firebase.js";

onAuthStateChanged(auth, async (user) => {

    if(user){

        const snap = await getDoc(doc(db, "users", user.uid));

        const role = snap.data().role;

        location.href = "home.html";

    }

});

const snap = await getDoc(doc(db, "users", user.uid));
const role = snap.data().role;

button.addEventListener("click",()=>{

    signInWithEmailAndPassword(

        auth,
        email.value,
        password.value

    )

    .then(()=>{

        location.href="home.html";

    })

    .catch(()=>{

        error.textContent="Email ou senha incorretos.";

    });

});

import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

document
.getElementById("logout")
.addEventListener("click",()=>{

    signOut(auth);

});