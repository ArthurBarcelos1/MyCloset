const DIAS_NOVO = 4;

document.querySelectorAll(".product").forEach(product => {
    const data = product.dataset.added;

    if (!data) return;

    const [dia, mes, ano] = data.split("/").map(Number);

    const dataProduto = new Date(2000 + ano, mes - 1, dia);
    const hoje = new Date();

    // Ignora horas para comparar apenas as datas
    dataProduto.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const diferencaDias = (hoje - dataProduto) / (1000 * 60 * 60 * 24);

    const badge = product.querySelector(".new");

    if (diferencaDias > DIAS_NOVO && badge) {
        badge.remove();
    }
});