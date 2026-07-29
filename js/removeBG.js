export async function removeBackground(file) {

    // Converte a imagem para Base64
    const base64 = await fileToBase64(file);

    // Envia para a Vercel Function
    const response = await fetch("/api/removeBackground", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: base64
        })
    });


    const data = await response.json();


    if (!data.image) {
        throw new Error("Erro ao remover fundo");
    }


    // Retorna a imagem PNG sem fundo
    return "data:image/png;base64," + data.image;
}



function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();


        reader.onload = () => {

            // Remove o começo:
            // data:image/png;base64,
            const base64 = reader.result.split(",")[1];

            resolve(base64);

        };


        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}