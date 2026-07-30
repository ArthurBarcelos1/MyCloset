import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const products = document.querySelector(".products");


// Se a página não tiver produtos, não executa
if (products) {

    auth.onAuthStateChanged(async (user) => {

        if (!user) return;


        products.innerHTML = "";


        const q = query(
            collection(db, "roupas"),
            where("uid", "==", user.uid)
        );


        const snapshot = await getDocs(q);


        snapshot.forEach((doc) => {

            const roupa = doc.data();


            const product = document.createElement("div");

            product.className = "product";

            // ID do documento Firebase
            product.id = doc.id;


            const img = document.createElement("img");

            img.src = `https://res.cloudinary.com/dvosyomdy/image/upload/${roupa.imagem}.png`;

            img.alt = roupa.nome;


            const like = document.createElement("i");

            like.classList.add("likeBTN");


            if (roupa.liked === 1) {

                like.className = "fa-solid fa-heart likeBTN";

            } else {

                like.className = "fa-regular fa-heart likeBTN";

            }


            product.appendChild(img);

            product.appendChild(like);


            products.appendChild(product);


        });

    });

}