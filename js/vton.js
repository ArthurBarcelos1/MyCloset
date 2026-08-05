import { Client, handle_file } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";

// ============================================================
// ELEMENTOS
// ============================================================

const PRODUCTS_CONTAINER = document.querySelector(".products");
const MODEL_IMAGE = document.getElementById("ModelImgDisplay");

const VTO_PROGRESS = document.getElementById("VTOProgress");
const VTO_PROGRESS_TEXT = document.getElementById("VTOProgressText");

// ============================================================
// ESTADO
// ============================================================

let vtoClient = null;

// Roupas atualmente selecionadas
let selectedProducts = [];

// URL da imagem original do modelo
let originalModelSrc = null;

// Identificador da geração atual
let generationId = 0;


// ============================================================
// DESCRIÇÕES DAS CATEGORIAS
// ============================================================

const CATEGORY_PROMPTS = {

    "Camisetas":
        "This is a t-shirt. Place it naturally on the person's upper body, covering the torso. Preserve the person's face, body, arms and other clothing.",

    "Camisas":
        "This is a shirt. Place it naturally on the person's upper body and torso. Preserve the person's face, body, arms and other clothing.",

    "Blusas":
        "This is a blouse or top. Place it naturally on the person's upper body and torso. Preserve the person's face, body, arms and other clothing.",

    "Casacos":
        "This is a coat. Place it naturally on the person's upper body, covering the torso and arms. Preserve the person's face, body and other clothing.",

    "Jaquetas":
        "This is a jacket. Place it naturally on the person's upper body, covering the torso and arms. Preserve the person's face, body and other clothing.",

    "Calças":
        "This is a pair of pants. Place it naturally on the person's lower body, covering the waist and legs. Preserve the person's upper-body clothing and appearance.",

    "Shorts":
        "This is a pair of shorts. Place it naturally on the person's lower body around the waist and thighs. Preserve the person's upper-body clothing and appearance.",

    "Saias":
        "This is a skirt. Place it naturally around the person's waist and lower body. Preserve the person's upper-body clothing and appearance.",

    "Vestidos":
        "This is a dress. Place it naturally on the person's body, covering the appropriate upper and lower body areas. Preserve the person's face and overall appearance.",

    "Calçados":
        "This is a pair of shoes. Place the shoes naturally on the person's feet. Preserve the person's legs, clothing and overall appearance.",

    "Sapatos":
        "This is a pair of shoes. Place the shoes naturally on the person's feet. Preserve the person's legs, clothing and overall appearance.",

    "Tênis":
        "This is a pair of sneakers. Place the sneakers naturally on the person's feet. Preserve the person's legs, clothing and overall appearance.",

    "Chapéus":
        "This is a hat. Place it naturally on the person's head. Preserve the person's face, hair and clothing.",

    "Bonés":
        "This is a cap. Place it naturally on the person's head. Preserve the person's face, hair and clothing.",

    "Bolsas":
        "This is a bag. Place it naturally in the appropriate position on the person's body, such as the shoulder, hand or side of the body. Preserve the person's clothing and appearance.",

    "Óculos":
        "This is a pair of glasses. Place them naturally on the person's face and eyes. Preserve the person's facial features and clothing.",

    "Acessórios":
        "This is a fashion accessory. Place it naturally on the appropriate part of the person's body according to its appearance."
};


// ============================================================
// CONECTAR AO IDM-VTON
// ============================================================

async function getVTOClient() {

    if (vtoClient) {
        return vtoClient;
    }

    console.log("Conectando ao IDM-VTON...");

    vtoClient = await Client.connect("yisol/IDM-VTON");

    console.log("IDM-VTON conectado.");

    return vtoClient;
}


// ============================================================
// PEGAR DADOS DA ROUPA NO FIRESTORE
// ============================================================

async function getClothingData(product) {

    const clothingId = product.id;

    if (!clothingId) {
        throw new Error("A roupa não possui um ID.");
    }

    const clothingRef = doc(
        db,
        "roupas",
        clothingId
    );

    const clothingSnap = await getDoc(clothingRef);

    if (!clothingSnap.exists()) {

        throw new Error(
            `A roupa "${clothingId}" não foi encontrada no Firestore.`
        );

    }

    return clothingSnap.data();
}


// ============================================================
// CRIAR DESCRIÇÃO PARA O IDM-VTON
// ============================================================

function createGarmentDescription(category, name) {

    const categoryPrompt = CATEGORY_PROMPTS[category];

    if (categoryPrompt) {

        return `${categoryPrompt} The garment is called "${name}".`;

    }

    // Caso apareça uma categoria que ainda não esteja
    // cadastrada acima.
    return `
This is a ${category}.
Place it naturally on the person's body in the appropriate
position for this type of clothing or accessory.
Preserve the person's face, body and other clothing.
The garment is called "${name}".
`.replace(/\s+/g, " ").trim();
}

// ============================================================
// PROGRESSO DO VTO
// ============================================================

function showVTOProgress(text) {

    if (!VTO_PROGRESS || !VTO_PROGRESS_TEXT) {
        return;
    }

    VTO_PROGRESS_TEXT.textContent = text;
    VTO_PROGRESS.style.display = "block";
}


function hideVTOProgress() {

    if (!VTO_PROGRESS) {
        return;
    }

    VTO_PROGRESS.style.display = "none";
}


// ============================================================
// NORMALIZAR IMAGEM PARA O VTO
// ============================================================

async function normalizeImageForVTO(imageUrl) {

    const response = await fetch(imageUrl);

    if (!response.ok) {

        throw new Error(
            `Não foi possível carregar a imagem: ${response.status}`
        );

    }

    const blob = await response.blob();

    const image = new Image();

    const objectUrl =
        URL.createObjectURL(blob);

    try {

        await new Promise((resolve, reject) => {

            image.onload = resolve;
            image.onerror = reject;

            image.src = objectUrl;

        });


        const canvas =
            document.createElement("canvas");


        canvas.width =
            image.naturalWidth;

        canvas.height =
            image.naturalHeight;


        const ctx =
            canvas.getContext("2d");


        /*
         * Cria um fundo branco.
         *
         * Se a imagem já possuir um fundo normal,
         * ele será preservado.
         *
         * O branco será utilizado somente nas
         * áreas transparentes.
         */

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.drawImage(
            image,
            0,
            0
        );


        const normalizedBlob =
            await new Promise(resolve => {

                canvas.toBlob(
                    resolve,
                    "image/png"
                );

            });


        if (!normalizedBlob) {

            throw new Error(
                "Não foi possível converter a imagem."
            );

        }


        return normalizedBlob;

    } finally {

        URL.revokeObjectURL(
            objectUrl
        );

    }
}


// ============================================================
// SELECIONAR / DESELECIONAR ROUPA
// ============================================================

function toggleProduct(product) {

    const alreadySelected =
        selectedProducts.includes(product);


    // ========================================================
    // DESELECIONAR
    // ========================================================

    if (alreadySelected) {

        selectedProducts =
            selectedProducts.filter(
                item => item !== product
            );


        // Remove SOMENTE o estilo aplicado pelo VTO
        product.style.border = "";


        console.log(
            "Roupa removida:",
            product.id
        );

    }


    // ========================================================
    // SELECIONAR
    // ========================================================

    else {

        selectedProducts.push(
            product
        );


        product.style.border =
            "2px solid var(--cor2)";


        console.log(
            "Roupa selecionada:",
            product.id
        );

    }


    // Gera novamente com a seleção atual
    generateSelectedClothes();
}


// ============================================================
// GERAR VTO
// ============================================================

async function generateSelectedClothes() {

    const currentGeneration =
        ++generationId;


    // ========================================================
    // NENHUMA ROUPA SELECIONADA
    // ========================================================

    if (
        selectedProducts.length === 0
    ) {

        if (originalModelSrc) {

            MODEL_IMAGE.src =
                originalModelSrc;

        }


        console.log(
            "Nenhuma roupa selecionada. Modelo original restaurado."
        );


        return;
    }


    // ========================================================
    // SALVAR IMAGEM ORIGINAL
    // ========================================================

    if (!originalModelSrc) {

        originalModelSrc =
            MODEL_IMAGE.src;

    }


    if (!originalModelSrc) {

        console.error(
            "Nenhuma imagem de modelo encontrada."
        );


        return;
    }


    try {

    console.log(
        `Iniciando VTO com ${selectedProducts.length} roupa(s)...`
    );

    showVTOProgress(
        selectedProducts.length > 1
            ? `Gerando ${selectedProducts.length} peças...`
            : "Gerando provador virtual..."
    );


    // ====================================================
    // CONECTAR AO IDM-VTON
    // ====================================================

    const app =
        await getVTOClient();


        // Começamos sempre da imagem original
        let currentImage =
            originalModelSrc;


        // ====================================================
        // PROCESSAR CADA ROUPA
        // ====================================================

        for (
            let i = 0;
            i < selectedProducts.length;
            i++
        ) {

            // Se o usuário selecionou ou removeu
            // outra roupa durante a geração,
            // abandonamos esta geração.

            if (
                currentGeneration !== generationId
            ) {

                console.log(
                    "Geração antiga cancelada."
                );

                return;
            }


            const product =
                selectedProducts[i];


            showVTOProgress(
                `Gerando peça ${i + 1} de ${selectedProducts.length}...`
            );


            console.log(
                `Processando roupa ${i + 1}/${selectedProducts.length}:`,
                product.id
            );


            // =================================================
            // FIRESTORE
            // =================================================

            const clothingData =
                await getClothingData(
                    product
                );


            const category =
                clothingData.categoria ||
                "Acessórios";


            const name =
                clothingData.nome ||
                "clothing";


            console.log(
                "Categoria:",
                category
            );


            console.log(
                "Nome:",
                name
            );


            // =================================================
            // IMAGEM DA ROUPA
            // =================================================

            const garmentImage =
                product.querySelector(
                    "img"
                );


            if (
                !garmentImage ||
                !garmentImage.src
            ) {

                throw new Error(
                    `A roupa "${product.id}" não possui uma imagem válida.`
                );

            }


            const garmentSrc =
                garmentImage.src;


            // =================================================
            // DESCRIÇÃO
            // =================================================

            const garmentDescription =
                createGarmentDescription(
                    category,
                    name
                );


            console.log(
                "Descrição enviada ao IDM-VTON:",
                garmentDescription
            );


            // =================================================
            // NORMALIZAR IMAGEM DO MODELO
            // =================================================

            const normalizedModel =
                await normalizeImageForVTO(
                    currentImage
                );


            // =================================================
            // CHAMADA DO IDM-VTON
            // =================================================

            console.log(
                "Enviando imagens para o IDM-VTON..."
            );


            const result =
                await app.predict(
                    "/tryon",
                    [

                        {
                            background:
                                handle_file(
                                    normalizedModel
                                ),

                            layers: [],

                            composite: null
                        },


                        // Imagem da roupa
                        handle_file(
                            garmentSrc
                        ),


                        // Descrição da roupa
                        garmentDescription,


                        // Auto mask
                        true,


                        // Crop
                        false,


                        // Denoising steps
                        30,


                        // Seed
                        42

                    ]
                );


            // =================================================
            // VERIFICAR SE A GERAÇÃO AINDA É ATUAL
            // =================================================

            if (
                currentGeneration !== generationId
            ) {

                console.log(
                    "Resultado descartado porque uma nova geração começou."
                );


                return;
            }


            console.log(
                "Resposta do IDM-VTON:",
                result
            );


            // =================================================
            // PEGAR IMAGEM RESULTANTE
            // =================================================

            const output =
                result.data?.[0];


            if (!output) {

                throw new Error(
                    "O IDM-VTON não retornou uma imagem."
                );

            }


            const outputUrl =
                typeof output === "string"
                    ? output
                    : output.url ||
                      output.path;


            if (!outputUrl) {

                console.error(
                    "Objeto retornado pelo IDM-VTON:",
                    output
                );


                throw new Error(
                    "Não foi possível encontrar a URL da imagem gerada."
                );

            }


            console.log(
                "Imagem gerada:",
                outputUrl
            );


            // =================================================
            // RESULTADO VIRA ENTRADA DA PRÓXIMA ROUPA
            // =================================================

            currentImage =
                outputUrl;


            // =================================================
            // SUBSTITUIR IMAGEM DO MODELO
            // =================================================

            MODEL_IMAGE.src =
                outputUrl;

        }

        hideVTOProgress();

        console.log(
            "VTO finalizado com sucesso."
        );


    } catch (error) {

        hideVTOProgress();

        console.error(
            "Erro ao gerar VTO:",
            error
        );

    }
}


// ============================================================
// CLIQUE NAS ROUPAS
// ============================================================

if (PRODUCTS_CONTAINER) {

    PRODUCTS_CONTAINER.addEventListener(
        "click",
        (event) => {

            const product =
                event.target.closest(
                    ".product"
                );


            if (!product) {
                return;
            }


            // Não executar VTO quando o usuário
            // estiver clicando no coração.

            if (
                event.target.closest(
                    ".fa-heart"
                )
            ) {

                return;
            }


            toggleProduct(
                product
            );

        }
    );

}