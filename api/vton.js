import { Client, handle_file } from "@gradio/client";

export default async function handler(req, res) {

    // ========================================================
    // CORS
    // ========================================================

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    // ========================================================
    // PREFLIGHT
    // ========================================================

    if (req.method === "OPTIONS") {

        return res.status(200).end();

    }


    // ========================================================
    // SOMENTE POST
    // ========================================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Método não permitido."
        });

    }


    try {

        // ====================================================
        // VERIFICAR TOKEN
        // ====================================================

        const HF_TOKEN =
            process.env.HF_TOKEN;


        if (!HF_TOKEN) {

            console.error(
                "HF_TOKEN não configurado na Vercel."
            );


            return res.status(500).json({
                error:
                    "Token do Hugging Face não configurado no servidor."
            });

        }


        // ====================================================
        // DADOS RECEBIDOS DO SITE
        // ====================================================

        const {
            modelUrl,
            garmentUrl,
            garmentDescription
        } = req.body;


        if (!modelUrl) {

            return res.status(400).json({
                error:
                    "modelUrl não foi informado."
            });

        }


        if (!garmentUrl) {

            return res.status(400).json({
                error:
                    "garmentUrl não foi informado."
            });

        }


        // ====================================================
        // CONECTAR AO IDM-VTON
        // ====================================================

        console.log(
            "Conectando ao IDM-VTON..."
        );


        const client =
            await Client.connect(
                "yisol/IDM-VTON",
                {
                    token: HF_TOKEN
                }
            );


        console.log(
            "Conectado ao IDM-VTON."
        );


        // ====================================================
        // GERAR
        // ====================================================

        console.log(
            "Iniciando geração VTO..."
        );


        const result =
            await client.predict(
                "/tryon",
                [

                    // ----------------------------------------
                    // MODELO
                    // ----------------------------------------

                    {
                        background:
                            handle_file(
                                modelUrl
                            ),

                        layers: [],

                        composite: null
                    },


                    // ----------------------------------------
                    // ROUPA
                    // ----------------------------------------

                    handle_file(
                        garmentUrl
                    ),


                    // ----------------------------------------
                    // DESCRIÇÃO
                    // ----------------------------------------

                    garmentDescription || "",


                    // ----------------------------------------
                    // AUTO MASK
                    // ----------------------------------------

                    true,


                    // ----------------------------------------
                    // AUTO CROP
                    // ----------------------------------------

                    false,


                    // ----------------------------------------
                    // DENOISING
                    // ----------------------------------------

                    30,


                    // ----------------------------------------
                    // SEED
                    // ----------------------------------------

                    42

                ]
            );


        console.log(
            "IDM-VTON terminou a geração."
        );


        // ====================================================
        // PEGAR RESULTADO
        // ====================================================

        const output =
            result?.data?.[0];


        if (!output) {

            console.error(
                "Resposta recebida:",
                result
            );


            throw new Error(
                "O IDM-VTON não retornou uma imagem."
            );

        }


        // ====================================================
        // TRANSFORMAR RESULTADO EM URL
        // ====================================================

        let outputUrl = null;


        if (
            typeof output === "string"
        ) {

            outputUrl =
                output;

        }

        else if (
            output.url
        ) {

            outputUrl =
                output.url;

        }

        else if (
            output.path
        ) {

            outputUrl =
                output.path;

        }


        if (!outputUrl) {

            console.error(
                "Output recebido:",
                output
            );


            throw new Error(
                "Não foi possível encontrar a URL da imagem gerada."
            );

        }


        // ====================================================
        // RESPONDER AO SITE
        // ====================================================

        return res.status(200).json({

            success: true,

            imageUrl:
                outputUrl

        });


    } catch (error) {

        console.error(
            "Erro no VTO:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Erro desconhecido ao gerar VTO."

        });

    }

}