import { Request } from "express";

export interface QuestionRequest extends Request {
  body: {
    questions: string[];
    tema: string;
  };
}
