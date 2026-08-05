import { auth, db } from "./firebase.js";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ============================================================
// CONTROLE DE COOLDOWN
// Altere o valor abaixo para controlar quantos DIAS o usuário
// precisa esperar antes de poder trocar a foto do modelo.
// Exemplos: 1 = 1 dia, 0.5 = 12 horas, 7 = 1 semana
// ============================================================
const COOLDOWN_DAYS = 1;

// ============================================================

const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const modelImg       = document.getElementById("ModelImgDisplay");
const uploadLabel    = document.getElementById("ModelUploadLabel");
const uploadIcon     = document.getElementById("ModelUploadIcon");
const uploadText     = document.getElementById("ModelUploadText");
const changeBtn      = document.getElementById("ChangeModelBTN");
const modelFileInput = document.getElementById("ModelFileInput");
const modelContainer = document.getElementById("ModelImage");

let currentUserId = null;

// Conecta ao Firestore após autenticação
auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    currentUserId = user.uid;
    await loadModelPhoto(user.uid);
});

// Carrega a foto salva do Firestore
async function loadModelPhoto(uid) {
    try {
        const snap = await getDoc(doc(db, "modelos", uid));

        if (snap.exists()) {
            const data = snap.data();
            showPhoto(data.imagem, data.atualizadoEm?.toMillis?.() || Date.now());
        } else {
            showUploadPrompt();
        }
    } catch (err) {
        console.error("Erro ao carregar foto do modelo:", err);
        showUploadPrompt();
    }
}

// Exibe a foto carregada e o botão de editar (se cooldown ok)
function showPhoto(src, savedTimestamp) {
    modelImg.src = src;
    modelImg.style.display = "block";
    uploadLabel.style.display = "none";
    modelContainer.classList.add("has-photo");

    const now = Date.now();
    const elapsed = now - savedTimestamp;
    const canChange = elapsed >= COOLDOWN_MS;

    // Remove mensagem de cooldown anterior
    const existing = modelContainer.querySelector(".model-cooldown-msg");
    if (existing) existing.remove();

    if (canChange) {
        changeBtn.style.display = "flex";
    } else {
        changeBtn.style.display = "none";
        const remainingMs = COOLDOWN_MS - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        const msg = document.createElement("div");
        msg.className = "model-cooldown-msg";
        msg.textContent = `Troca disponível em ${hours}h ${minutes}min`;
        modelContainer.appendChild(msg);
    }
}

// Exibe o prompt de upload (sem foto ainda)
function showUploadPrompt() {
    modelImg.style.display = "none";
    modelImg.src = "";
    uploadLabel.style.display = "flex";
    changeBtn.style.display = "none";
    modelContainer.classList.remove("has-photo");
}

// Clique no botão de alterar foto (abre o seletor)
changeBtn?.addEventListener("click", () => {
    modelFileInput.click();
});

// Quando um arquivo é selecionado
modelFileInput?.addEventListener("change", async () => {
    const file = modelFileInput.files[0];
    if (!file || !currentUserId) return;

    // Verifica cooldown no Firestore antes de prosseguir
    try {
        const snap = await getDoc(doc(db, "modelos", currentUserId));
        if (snap.exists()) {
            const data = snap.data();
            const savedTs = data.atualizadoEm?.toMillis?.() || 0;
            const elapsed = Date.now() - savedTs;
            if (elapsed < COOLDOWN_MS) {
                const remainingMs = COOLDOWN_MS - elapsed;
                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                alert(`Você só pode alterar a foto após ${COOLDOWN_DAYS} dia(s).\nTempo restante: ${hours}h ${minutes}min.`);
                return;
            }
        }
    } catch (err) {
        console.error("Erro ao verificar cooldown:", err);
    }

    await processAndUploadModelPhoto(file);
});

// Processa (remove fundo) e faz upload da foto do modelo
async function processAndUploadModelPhoto(file) {
    // Feedback visual enquanto processa
    uploadLabel.style.display = "none";
    changeBtn.style.display = "none";
    modelImg.src = URL.createObjectURL(file);
    modelImg.style.display = "block";

    // Exibe spinner de processamento
    const spinner = document.createElement("div");
    spinner.id = "ModelSpinner";
    spinner.innerHTML = `
        <div style="
            position: absolute;
            inset: 0;
            background: rgba(255,255,255,0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 20;
            gap: 10px;
            border-radius: 14px;
        ">
            <div style="
                width: 36px; height: 36px;
                border: 4px solid var(--cor1);
                border-top-color: var(--cor2);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            "></div>
            <p style="font-size: 12px; color: var(--cor2); font-weight: bold;">Removendo fundo...</p>
        </div>
    `;
    // Injeta animação de spin se não existir
    if (!document.getElementById("spin-style")) {
        const style = document.createElement("style");
        style.id = "spin-style";
        style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
    modelContainer.appendChild(spinner);

    try {
        // Converte para base64
        const base64 = await fileToBase64(file);

        // Remove o fundo via API
        const response = await fetch("https://my-closet-plum.vercel.app/api/removeBackground", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 })
        });

        const data = await response.json();

        if (!data.image) {
            throw new Error("Imagem sem fundo não retornada.");
        }

        const imagemSemFundo = "data:image/png;base64," + data.image;

        // Faz upload para o Cloudinary
        spinner.querySelector("p").textContent = "Enviando foto...";

        const uploadResp = await fetch("https://my-closet-plum.vercel.app/api/uploadCloudinary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imagemSemFundo })
        });

        const uploadData = await uploadResp.json();

        if (!uploadData.public_id) {
            throw new Error("Falha no upload.");
        }

        const cloudinaryUrl = `https://res.cloudinary.com/dvosyomdy/image/upload/${uploadData.public_id}.png`;

        // Salva no Firestore com timestamp do servidor
        await setDoc(doc(db, "modelos", currentUserId), {
            uid: currentUserId,
            imagem: cloudinaryUrl,
            atualizadoEm: serverTimestamp()
        });

        modelImg.src = cloudinaryUrl;
        showPhoto(cloudinaryUrl, Date.now());

        alert("Foto do modelo salva com sucesso!");

    } catch (err) {
        console.error("Erro ao processar foto do modelo:", err);
        alert("Erro ao processar a foto. Tente novamente.");
        showUploadPrompt();
    } finally {
        spinner.remove();
        modelFileInput.value = "";
    }
}

// Converte File para base64 sem prefixo
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
