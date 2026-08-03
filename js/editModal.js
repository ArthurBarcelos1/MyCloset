import { auth, db } from "./firebase.js";
import {
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { CATEGORIES } from "./categories.js";

// ============================================================
// Injeta o HTML do modal de edição no body
// ============================================================
function injectModalHTML() {
    if (document.getElementById("EditModal")) return;

    const modal = document.createElement("div");
    modal.className = "NewItem";
    modal.id = "EditModal";
    modal.style.display = "none";

    const categoryButtons = CATEGORIES.map((cat, i) => {
        const classes = ["categoryBTN"];
        if (i === 0) classes.push("sideStartButton");
        if (i === CATEGORIES.length - 1) classes.push("sideEndButton");
        return `<button type="button" class="${classes.join(" ")}" data-category="${cat}">${cat}</button>`;
    }).join("");

    modal.innerHTML = `
        <div class="NewItemCard">
            <input type="text" id="EditNameInput" placeholder="Nome da roupa">
            <div class="categories-wrapper">
                <div class="categories" id="EditCategorySelector">
                    ${categoryButtons}
                </div>
            </div>
            <div class="NewItemCardBTNS">
                <button id="EditSaveBTN">Salvar</button>
                <button id="EditDeleteBTN" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button id="EditCancelBTN">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================================
// Estado do modal
// ============================================================
let editingDocId = null;
let editingSelectedCategory = "";

function openEditModal(product) {
    const modal = document.getElementById("EditModal");
    if (!modal) return;

    editingDocId = product.id;
    editingSelectedCategory = product.dataset.categoria || "";

    document.getElementById("EditNameInput").value =
        product.dataset.nome || product.querySelector("img")?.alt || "";

    document.querySelectorAll("#EditCategorySelector .categoryBTN").forEach(btn => {
        btn.classList.toggle("selectedCategory",
            btn.getAttribute("data-category") === editingSelectedCategory);
    });

    modal.style.display = "flex";
}

function closeEditModal() {
    const modal = document.getElementById("EditModal");
    if (modal) modal.style.display = "none";
    editingDocId = null;
    editingSelectedCategory = "";
}

// ============================================================
// Eventos do modal
// ============================================================
function bindModalEvents() {
    const modal = document.getElementById("EditModal");

    // Fechar ao clicar no fundo escuro
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeEditModal();
    });

    // Cancelar
    document.getElementById("EditCancelBTN").addEventListener("click", closeEditModal);

    // Seleção de categoria dentro do modal de edição
    document.getElementById("EditCategorySelector").addEventListener("click", (e) => {
        const btn = e.target.closest(".categoryBTN");
        if (!btn) return;
        document.querySelectorAll("#EditCategorySelector .categoryBTN")
            .forEach(b => b.classList.remove("selectedCategory"));
        btn.classList.add("selectedCategory");
        editingSelectedCategory = btn.getAttribute("data-category");
    });

    // Salvar edição
    const saveBtn = document.getElementById("EditSaveBTN");
    saveBtn.addEventListener("click", async () => {
        if (!editingDocId) return;
        const nome = document.getElementById("EditNameInput").value.trim();
        if (!nome) { alert("Digite um nome."); return; }
        if (!editingSelectedCategory) { alert("Selecione o tipo de roupa."); return; }

        saveBtn.disabled = true;
        saveBtn.textContent = "Salvando...";
        try {
            await updateDoc(doc(db, "roupas", editingDocId), { nome, categoria: editingSelectedCategory });
            const productEl = document.getElementById(editingDocId);
            if (productEl) {
                productEl.dataset.nome = nome;
                productEl.dataset.categoria = editingSelectedCategory;
                const img = productEl.querySelector("img");
                if (img) img.alt = nome;
            }
            alert("Roupa atualizada com sucesso!");
            closeEditModal();
        } catch (err) {
            console.error("Erro ao atualizar roupa:", err);
            alert("Erro ao salvar.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salvar";
        }
    });

    // Excluir
    const deleteBtn = document.getElementById("EditDeleteBTN");
    deleteBtn.addEventListener("click", async () => {
        if (!editingDocId) return;
        if (!confirm("Tem certeza de que deseja excluir esta roupa?")) return;
        deleteBtn.disabled = true;
        try {
            await deleteDoc(doc(db, "roupas", editingDocId));
            const productEl = document.getElementById(editingDocId);
            if (productEl) productEl.remove();
            alert("Roupa excluída com sucesso!");
            closeEditModal();
        } catch (err) {
            console.error("Erro ao excluir roupa:", err);
            alert("Erro ao excluir a roupa.");
        } finally {
            deleteBtn.disabled = false;
        }
    });
}

// ============================================================
// Delegacao de evento: clique em qualquer .product abre modal
// ============================================================
document.addEventListener("click", (event) => {
    const product = event.target.closest(".product");
    if (!product) return;
    if (product.id === "NewBTN" || event.target.classList.contains("likeBTN")) return;
    if (!auth.currentUser) return;
    openEditModal(product);
});

// ============================================================
// Inicializacao
// ============================================================
injectModalHTML();
bindModalEvents();
