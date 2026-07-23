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

onAuthStateChanged(auth,user=>{

    if(user){

        location.href="home.html";

    }

});

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