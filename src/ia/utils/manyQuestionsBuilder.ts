import { env } from "../../config/env";

export function manyQuestionsPrompt(tema: string, readyQuestions: string): string {
  if (!env.AI_MANY_ANSWERS_PROMPT) {
    throw new Error('AI_PROMPT no está definido en el archivo .env');
  }

  // Reemplazo seguro de variables
  return env.AI_MANY_ANSWERS_PROMPT
    .replace(/{{tema}}/g, tema)
    .replace(/{{readyQuestions}}/g, readyQuestions);
}