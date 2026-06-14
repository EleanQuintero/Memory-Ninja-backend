import { env } from "../../config/env.js";
import { DEFAULT_MANY_ANSWERS_PROMPT } from "./prompts.js";

export function manyQuestionsPrompt(tema: string, readyQuestions: string): string {
  const template = env.AI_MANY_ANSWERS_PROMPT ?? DEFAULT_MANY_ANSWERS_PROMPT;

  // Reemplazo seguro de variables
  return template
    .replace(/{{tema}}/g, tema)
    .replace(/{{readyQuestions}}/g, readyQuestions);
}