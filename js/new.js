import { removeBackground } from "./removeBG.js";
import { auth, db } from "./firebase.js";
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const newItem = document.querySelector(".NewItem");
let editingDocId = null;

function resetModalState() {
    editingDocId = null;
    document.getElementById("DesignNameInput").value = "";
    imageInput.value = "";
    croppedSquareFile = null;
    selectedCategory = "";
    document.querySelectorAll("#CategorySelector .categoryBTN").forEach(b => b.classList.remove("selectedCategory"));

    imagePreview.removeAttribute("src");
    imagePreview.style.display = "none";
    uploadIcon.style.display = "block";
    uploadText.style.display = "block";

    const imageUploadLabel = document.querySelector(".ImageUpload");
    if (imageUploadLabel) {
        imageUploadLabel.style.pointerEvents = "auto";
        imageUploadLabel.style.cursor = "pointer";
    }
    imageInput.disabled = false;

    const deleteBtn = document.getElementById("DeleteDesignBTN");
    if (deleteBtn) {
        deleteBtn.style.display = "none";
    }

    if (newItem) newItem.style.display = "none";
}

document.getElementById("CancelDesignBTN")?.addEventListener("click", () => {
    resetModalState();
});

document.getElementById("NewBTN")?.addEventListener("click", () => {
    resetModalState();
    if (newItem) newItem.style.display = "flex";
});

// Clique em um produto já criado para editar nome e categoria (imagem bloqueada)
document.addEventListener("click", (event) => {
    const product = event.target.closest(".product");
    if (!product) return;

    if (product.id === "NewBTN" || event.target.classList.contains("likeBTN")) {
        return;
    }

    if (!newItem) return;

    editingDocId = product.id;

    const currentName = product.dataset.nome || product.querySelector("img")?.alt || "";
    const currentCategory = product.dataset.categoria || "";
    const imgSrc = product.querySelector("img")?.src || "";

    document.getElementById("DesignNameInput").value = currentName;
    selectedCategory = currentCategory;

    document.querySelectorAll("#CategorySelector .categoryBTN").forEach(btn => {
        if (btn.getAttribute("data-category") === currentCategory) {
            btn.classList.add("selectedCategory");
        } else {
            btn.classList.remove("selectedCategory");
        }
    });

    imagePreview.src = imgSrc;
    imagePreview.style.display = "block";
    uploadIcon.style.display = "none";
    uploadText.style.display = "none";

    const imageUploadLabel = document.querySelector(".ImageUpload");
    if (imageUploadLabel) {
        imageUploadLabel.style.pointerEvents = "none";
        imageUploadLabel.style.cursor = "not-allowed";
    }
    imageInput.disabled = true;

    // Exibe o botão de exclusão no modo de edição
    const deleteBtn = document.getElementById("DeleteDesignBTN");
    if (deleteBtn) {
        deleteBtn.style.display = "inline-flex";
    }

    newItem.style.display = "flex";
});

// Evento do Botão de Excluir com confirmação
document.getElementById("DeleteDesignBTN")?.addEventListener("click", async () => {
    if (!editingDocId) return;

    const confirmDelete = confirm("Tem certeza de que deseja excluir esta roupa?");
    if (!confirmDelete) return;

    const deleteBtn = document.getElementById("DeleteDesignBTN");

    try {
        if (deleteBtn) deleteBtn.disabled = true;

        await deleteDoc(doc(db, "roupas", editingDocId));

        const productEl = document.getElementById(editingDocId);
        if (productEl) {
            productEl.remove();
        }

        alert("Roupa excluída com sucesso!");
        resetModalState();
    } catch (error) {
        console.error("Erro ao excluir roupa:", error);
        alert("Erro ao excluir a roupa.");
    } finally {
        if (deleteBtn) deleteBtn.disabled = false;
    }
});

const imageInput = document.getElementById("ImageInput");
const imagePreview = document.getElementById("ImagePreview");
const uploadIcon = document.getElementById("UploadIcon");
const uploadText = document.getElementById("UploadText");

let croppedSquareFile = null;
let selectedCategory = "";

// Seleção do tipo de roupa (categorias) via delegação de evento
document.addEventListener("click", (evt) => {
    const btn = evt.target.closest("#CategorySelector .categoryBTN");
    if (!btn) return;

    document.querySelectorAll("#CategorySelector .categoryBTN").forEach(b => b.classList.remove("selectedCategory"));
    btn.classList.add("selectedCategory");
    selectedCategory = btn.getAttribute("data-category");
});

// Crop automático em formato quadrado centralizando a imagem
function cropImageToSquare(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const minSide = Math.min(img.width, img.height);
            const srcX = (img.width - minSide) / 2;
            const srcY = (img.height - minSide) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = minSide;
            canvas.height = minSide;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, srcX, srcY, minSide, minSide, 0, 0, minSide, minSide);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Erro ao recortar a imagem."));
                    return;
                }
                const croppedFile = new File([blob], file.name, { type: file.type || "image/png" });
                resolve(croppedFile);
            }, file.type || "image/png");
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];

    if (!file) {
        croppedSquareFile = null;
        imagePreview.removeAttribute("src");
        imagePreview.style.display = "none";
        uploadIcon.style.display = "block";
        uploadText.style.display = "block";
        return;
    }

    try {
        croppedSquareFile = await cropImageToSquare(file);

        imagePreview.src = URL.createObjectURL(croppedSquareFile);
        imagePreview.style.display = "block";

        uploadIcon.style.display = "none";
        uploadText.style.display = "none";
    } catch (error) {
        console.error("Erro ao processar o crop da imagem:", error);
        alert("Erro ao carregar a imagem.");
    }
});

const saveButton = document.getElementById("SaveDesignBTN");

saveButton.addEventListener("click", async () => {

    try {

        const nome = document.getElementById("DesignNameInput").value.trim();

        if (!nome) {
            alert("Digite um nome.");
            return;
        }

        if (!selectedCategory) {
            alert("Selecione o tipo de roupa.");
            return;
        }

        if (!auth.currentUser) {
            alert("Usuário não está logado.");
            return;
        }

        // SE ESTIVER EM MODO DE EDIÇÃO DE ITEM EXISTENTE
        if (editingDocId) {
            saveButton.disabled = true;
            saveButton.textContent = "Salvando...";

            await updateDoc(doc(db, "roupas", editingDocId), {
                nome: nome,
                categoria: selectedCategory
            });

            const productEl = document.getElementById(editingDocId);
            if (productEl) {
                productEl.dataset.nome = nome;
                productEl.dataset.categoria = selectedCategory;
                const img = productEl.querySelector("img");
                if (img) img.alt = nome;
            }

            alert("Roupa atualizada com sucesso!");
            resetModalState();
            return;
        }

        // SE ESTIVER EM MODO DE CRIAÇÃO (NOVO ITEM)
        if (!croppedSquareFile) {
            alert("Selecione uma imagem.");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Removendo fundo...";

        const imagemSemFundo = await removeBackground(croppedSquareFile);

        saveButton.textContent = "Salvando...";

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

        await addDoc(collection(db, "roupas"), {

            uid: auth.currentUser.uid,

            nome: nome,

            categoria: selectedCategory,

            imagem: uploadData.public_id,

            criadoEm: serverTimestamp()

        });

        alert("Roupa salva com sucesso!");

        location.reload();

        resetModalState();

    } catch (error) {

        console.error(error);

        alert("Erro ao salvar a roupa.");

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Salvar";

    }

});