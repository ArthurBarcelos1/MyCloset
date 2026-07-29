import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("role");
        location.href = "index.html";
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    }
});

window.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");

    console.log("Role:", role);

});