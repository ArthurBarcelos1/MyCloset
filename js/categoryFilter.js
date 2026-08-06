document.addEventListener("DOMContentLoaded", () => {

    const categoriesContainer =
        document.querySelector(".categories");

    const productsContainer =
        document.querySelector(".products");


    if (!categoriesContainer || !productsContainer) {
        return;
    }


    categoriesContainer.addEventListener("click", (event) => {

        const button =
            event.target.closest(".categoryBTN");


        if (!button) {
            return;
        }


        const selectedCategory =
            button.getAttribute("data-category");


        if (!selectedCategory) {
            return;
        }


        const isActive =
            button.classList.contains("category-active");


        // ====================================================
        // CLICOU NOVAMENTE NA CATEGORIA ATIVA
        // ====================================================

        if (isActive) {

            button.classList.remove(
                "category-active"
            );


            productsContainer
                .querySelectorAll(".product")
                .forEach((product) => {

                    product.style.display = "";

                });


            return;
        }


        // ====================================================
        // REMOVER CATEGORIA ATIVA ANTERIOR
        // ====================================================

        categoriesContainer
            .querySelectorAll(".categoryBTN")
            .forEach((categoryButton) => {

                categoryButton.classList.remove(
                    "category-active"
                );

            });


        // ====================================================
        // ATIVAR CATEGORIA
        // ====================================================

        button.classList.add(
            "category-active"
        );


        // ====================================================
        // FILTRAR PRODUTOS
        // ====================================================

        productsContainer
            .querySelectorAll(".product")
            .forEach((product) => {

                const productCategory =
                    product.getAttribute("data-categoria");


                if (
                    productCategory === selectedCategory
                ) {

                    product.style.display = "";

                } else {

                    product.style.display = "none";

                }

            });

    });

});