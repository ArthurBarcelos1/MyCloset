export async function removeBackground(file) {

    console.log("Enviando imagem para remover fundo:", file.name);

    const base64 = await fileToBase64(file);

    const response = await fetch("/api/removeBackground", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: base64
        })
    });

    console.log("Resposta da Vercel:", response.status);

    const data = await response.json();

    console.log("Dados recebidos:", data);

    if (!data.image) {
        throw new Error("Imagem não retornada");
    }

    return "data:image/png;base64," + data.image;
}


function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result.split(",")[1]);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}