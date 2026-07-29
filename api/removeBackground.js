import axios from "axios";
import FormData from "form-data";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido"
        });
    }


    try {

        const { image } = req.body;


        if (!image) {
            return res.status(400).json({
                error: "Imagem não enviada"
            });
        }


        const form = new FormData();

        form.append(
            "image_file",
            Buffer.from(image, "base64"),
            {
                filename: "image.png"
            }
        );

        form.append("size", "auto");


        const response = await axios.post(
            "https://api.remove.bg/v1.0/removebg",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "X-Api-Key": process.env.REMOVE_BG_KEY
                },
                responseType: "arraybuffer"
            }
        );


        const result = Buffer
            .from(response.data)
            .toString("base64");


        return res.status(200).json({
            image: result
        });


    } catch(error) {

        console.error(error.response?.data || error);

        return res.status(500).json({
            error: "Erro interno"
        });

    }

}