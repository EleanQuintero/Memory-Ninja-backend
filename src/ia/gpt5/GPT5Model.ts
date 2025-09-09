import OpenAI from "openai";
import { IAInterface } from "../IAInterface";


export class GPTmini implements IAInterface {
    private model: string = "openai/gpt-5-nano";
    private endpoint: string = "https://models.github.ai/inference";
    private token: string | undefined = process.env.GPT5_GITHUB_TOKEN;

    constructor() {
        this.model = this.model;
        this.endpoint = this.endpoint;
        this.token = this.token;
    }

    async generateAnswer(tema: string, questions: string[]): Promise<string> {
        try {
            const client = new OpenAI({ baseURL: this.endpoint, apiKey: this.token });
            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "What is the capital of France?" },
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




