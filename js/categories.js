// Lista centralizada de categorias. Para adicionar ou remover uma categoria, altere este array:
export const CATEGORIES = [
    "Bolsas",
    "Blusas",
    "Blusas de Frio",
    "Calças",
    "Camisas",
    "Saias",
    "Sapatos",
    "Vestidos"
];

// Renderiza os botões em todos os containers de classe .categories na página
export function renderAllCategories() {
    const containers = document.querySelectorAll(".categories");

    containers.forEach((container) => {
        const activeBtn = container.querySelector(".selectedCategory");
        const selectedCatName = activeBtn ? activeBtn.getAttribute("data-category") : null;

        container.innerHTML = "";

        CATEGORIES.forEach((cat, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = cat;
            btn.setAttribute("data-category", cat);
            btn.classList.add("categoryBTN");

            if (index === 0) {
                btn.classList.add("sideStartButton");
            }
            if (index === CATEGORIES.length - 1) {
                btn.classList.add("sideEndButton");
            }

            if (cat === selectedCatName) {
                btn.classList.add("selectedCategory");
            }

            container.appendChild(btn);
        });
    });
}

// Configura rolamento smooth (suave com aceleração e desaceleração por lerp) e arraste (drag-to-scroll)
export function setupSmoothCategoryScroll() {
    const containers = document.querySelectorAll(".categories, .categories-wrapper");

    containers.forEach((container) => {
        if (container.dataset.smoothScrollInit === "true") return;
        container.dataset.smoothScrollInit = "true";

        let targetX = container.scrollLeft;
        let isAnimating = false;

        function updateScroll() {
            const diff = targetX - container.scrollLeft;
            if (Math.abs(diff) > 0.3) {
                container.scrollLeft += diff * 0.12; // Easing suave
                requestAnimationFrame(updateScroll);
            } else {
                container.scrollLeft = targetX;
                isAnimating = false;
            }
        }

        container.addEventListener("wheel", (evt) => {
            const delta = evt.deltaY || evt.deltaX;
            if (delta === 0) return;

            evt.preventDefault();
            const maxScroll = container.scrollWidth - container.clientWidth;
            targetX = Math.max(0, Math.min(maxScroll, targetX + delta * 0.65));

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(updateScroll);
            }
        }, { passive: false });

        // Arraste com o mouse (Drag to Scroll)
        let isDown = false;
        let startX = 0;
        let scrollLeftStart = 0;
        let dragged = false;

        container.addEventListener("mousedown", (e) => {
            isDown = true;
            dragged = false;
            container.style.cursor = "grabbing";
            startX = e.pageX - container.offsetLeft;
            scrollLeftStart = container.scrollLeft;
            targetX = container.scrollLeft;
        });

        container.addEventListener("mouseleave", () => {
            if (!isDown) return;
            isDown = false;
            container.style.cursor = "";
        });

        container.addEventListener("mouseup", () => {
            if (!isDown) return;
            isDown = false;
            container.style.cursor = "";
        });

        container.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.3;
            if (Math.abs(walk) > 3) dragged = true;
            container.scrollLeft = scrollLeftStart - walk;
            targetX = container.scrollLeft;
        });
    });
}

// Inicialização automática ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    renderAllCategories();
    setupSmoothCategoryScroll();
});

// Executa imediatamente para scripts em carregamento diferido ou módulos
renderAllCategories();
setupSmoothCategoryScroll();
