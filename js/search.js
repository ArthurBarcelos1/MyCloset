// Estado dos filtros ativos
let activeCategory = null;
let activeText = "";

// Aplica os dois filtros combinados (texto + categoria)
function applyFilters() {
    const products = document.querySelectorAll(".products .product");
    products.forEach(product => {
        const nome = (product.dataset.nome || product.querySelector("img")?.alt || "").toLowerCase();
        const categoria = (product.dataset.categoria || "").toLowerCase();

        const matchesText = !activeText || nome.includes(activeText);
        const matchesCategory = !activeCategory || categoria === activeCategory.toLowerCase();

        product.style.display = (matchesText && matchesCategory) ? "" : "none";
    });
}

// Filtro por texto
const search = document.getElementById("search");
if (search) {
    search.addEventListener("input", () => {
        activeText = search.value.toLowerCase().trim();
        applyFilters();
    });
}

// Filtro por categoria (via evento customizado do categories.js)
document.addEventListener("categorychange", (e) => {
    activeCategory = e.detail?.category || null;
    applyFilters();
});