window.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");
    const adminBTN = document.getElementById("adminBTN");

    if (role === "Admin" && adminBTN) {

        adminBTN.style.display = "";

    }

});