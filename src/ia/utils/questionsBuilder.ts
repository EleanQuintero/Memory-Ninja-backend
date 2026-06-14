import { env } from "../../config/env.js";
import { DEFAULT_ANSWER_PROMPT } from "./prompts.js";

export function questionsPrompt(tema: string, pregunta: string): string {
    const template = env.AI_ANSWERS_PROMPT ?? DEFAULT_ANSWER_PROMPT;

    // Reemplazo seguro de variables
    return template
        .replace(/{{tema}}/g, tema)
        .replace(/{{pregunta}}/g, pregunta);
}