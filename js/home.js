import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


onAuthStateChanged(auth, user => {

    if (!user) {
        location.href = "index.html";
    }

});


const logout = document.getElementById("logout");


if (logout) {

    logout.onclick = () => {

        signOut(auth)
        .then(() => {

            location.href = "index.html";

        });

    };

}