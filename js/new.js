import { removeBackground } from "./removeBG.js";

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


imageInput.addEventListener("change", async () => {

    const file = imageInput.files[0];

    if (!file) return;


    // Mostra a imagem original enquanto processa
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";

    uploadIcon.style.display = "none";
    uploadText.style.display = "none";


    try {

        const imagemSemFundo = await removeBackground(file);

        // Troca pela imagem sem fundo
        imagePreview.src = imagemSemFundo;


    } catch (error) {

        console.error(error);
        alert("Erro ao remover fundo da imagem");

    }

});