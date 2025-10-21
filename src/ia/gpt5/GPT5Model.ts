import OpenAI from "openai";
import { IAInterface } from "../IAInterface";


export class GPTmini implements IAInterface {
    private model: string = "openai/gpt-5";
    private endpoint: string = process.env.KURAYAMI_ENDPOINT || ""
    private token: string | undefined = process.env.GPT5_GITHUB_TOKEN;

    constructor() {
        this.model = this.model;
        this.endpoint = this.endpoint;
        this.token = this.token;
    }




    async generateAnswer(tema: string, questions: string[]): Promise<string> {
        try {
            console.log("Generating answer with GPT-5 ");
            const client = new OpenAI({ baseURL: this.endpoint, apiKey: this.token, timeout: 10000, maxRetries: 1 });
            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Eres un experto EXCLUSIVAMENTE en ${tema}. 
                                    Tu respuesta debe estar 100% relacionada con el contexto de ${tema}.
                                    Si la pregunta contiene términos ambiguos, SIEMPRE interprétalos desde la perspectiva de ${tema}.
                                    Ignora cualquier otra interpretación de otros campos o disciplinas.
                                    Responde con precisión, claridad y brevedad. Máximo 256 caracteres.` },
                    { role: "user", content: `En el contexto específico de ${tema}: ${questions[0]}` },
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




