import { env } from "../../config/env";

export function questionsPrompt(tema: string, pregunta: string): string {
    if (!env.AI_ANSWERS_PROMPT) {
        throw new Error('AI_PROMPT no está definido en el archivo .env');
    }

    // Reemplazo seguro de variables
    return env.AI_ANSWERS_PROMPT
        .replace(/{{tema}}/g, tema)
        .replace(/{{pregunta}}/g, pregunta);
}