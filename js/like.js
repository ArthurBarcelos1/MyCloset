import { db } from "./firebase.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("likeBTN")) return;


    const button = event.target;

    const product = button.closest(".product");

    if (!product) return;


    const roupaId = product.id;


    try {

        const estaCurtido = button.classList.contains("fa-solid");


        if (estaCurtido) {

            // Remove like
            button.className = "fa-regular fa-heart likeBTN";

            await updateDoc(doc(db, "roupas", roupaId), {
                liked: 0
            });


        } else {

            // Adiciona like
            button.className = "fa-solid fa-heart likeBTN";

            await updateDoc(doc(db, "roupas", roupaId), {
                liked: 1
            });

        }


    } catch (error) {

        console.error("Erro ao atualizar like:", error);

    }

});