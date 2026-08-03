import { removeBackground } from "./removeBG.js";
import { auth, db } from "./firebase.js";
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const newItem = document.querySelector(".NewItem");

document.getElementById("CancelDesignBTN").addEventListener("click", () => {
    newItem.style.display = "none";
});

document.getElementById("NewBTN").addEventListener("click", () => {
    newItem.style.display = "flex";
});


const imageInput = document.getElementById("ImageInput");
const imagePreview = document.getElementById("ImagePreview");
const uploadIcon = document.getElementById("UploadIcon");
const uploadText = document.getElementById("UploadText");


imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        imagePreview.removeAttribute("src");
        imagePreview.style.display = "none";
        uploadIcon.style.display = "block";
        uploadText.style.display = "block";
        return;
    }

    // Mostra apenas a imagem original selecionada (sem chamar a API)
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";

    uploadIcon.style.display = "none";
    uploadText.style.display = "none";
});

const saveButton = document.getElementById("SaveDesignBTN");

saveButton.addEventListener("click", async () => {

    try {

        const nome = document.getElementById("DesignNameInput").value.trim();
        const file = imageInput.files[0];

        if (!nome) {
            alert("Digite um nome.");
            return;
        }

        if (!file) {
            alert("Selecione uma imagem.");
            return;
        }

        if (!auth.currentUser) {
            alert("Usuário não está logado.");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Removendo fundo...";

        // Remove o fundo da imagem apenas ao salvar
        const imagemSemFundo = await removeBackground(file);

        saveButton.textContent = "Salvando...";

        // Upload para o Cloudinary
        const uploadResponse = await fetch("https://my-closet-plum.vercel.app/api/uploadCloudinary", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                image: imagemSemFundo
            })

        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.public_id) {
            throw new Error("Falha no upload da imagem.");
        }

        // Salva no Firestore
        await addDoc(collection(db, "roupas"), {

            uid: auth.currentUser.uid,

            nome: nome,

            imagem: uploadData.public_id,

            criadoEm: serverTimestamp()

        });

        alert("Roupa salva com sucesso!");

        // Limpa formulário
        document.getElementById("DesignNameInput").value = "";
        imageInput.value = "";

        imagePreview.removeAttribute("src");
        imagePreview.style.display = "none";

        uploadIcon.style.display = "block";
        uploadText.style.display = "block";

        newItem.style.display = "none";

    } catch (error) {

        console.error(error);

        alert("Erro ao salvar a roupa.");

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Salvar";

    }

});