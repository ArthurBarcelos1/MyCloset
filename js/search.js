const search = document.getElementById("search");
const products = document.querySelectorAll(".products .product");

search.addEventListener("input", () => {
    const value = search.value.toLowerCase().trim();

    products.forEach(product => {
        const id = product.id.toLowerCase();

        if (id.includes(value)) {
            product.style.display = "";
        } else {
            product.style.display = "none";
        }
    });
});