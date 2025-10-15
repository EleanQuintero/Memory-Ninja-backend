import OpenAI from "openai";
import { IAInterface } from "../IAInterface";


export class GPTmini implements IAInterface {
    private model: string = "openai/gpt-5-mini";
    private endpoint: string = process.env.KURAYAMI_ENDPOINT || ""
    private token: string | undefined = process.env.GPT5_GITHUB_TOKEN;

    constructor() {
        this.model = this.model;
        this.endpoint = this.endpoint;
        this.token = this.token;
    }




    async generateAnswer(tema: string, questions: string[]): Promise<string> {
        console.log(this.token)
        try {
            console.log("Generating answer with GPT-5 Mini model...");
            const client = new OpenAI({ baseURL: this.endpoint, apiKey: this.token, timeout: 10000, maxRetries: 1 });
            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: `Eres un experto en ${tema}. Responde con precisión, claridad y brevedad a la siguiente pregunta. Explica con un lenguaje directo y fácil de entender. Es muy importante que la respuesta no sea de mas de 256 caracteres.` },
                    { role: "user", content: questions[0] },
                ],
                model: this.model,
            });

            console.log(response.choices[0].message.content);
            const answer = response.choices[0].message.content;

            if (!answer) {
                throw new Error("No answer generated");
            }
            return answer

        } catch (error) {
            console.error("The sample encountered an error:", error);
            return "Error generating answer";
        }
    }




    async generateMultipleAnswer(tema: string, questions: string[]): Promise<string[]> {
        return [""]
    }

}




