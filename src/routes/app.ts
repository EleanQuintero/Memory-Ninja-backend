import { Router } from "express";
import { askQuestion } from "../controllers/QuestionController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { questionsRequestSchema } from "../schemes/questionRequest.js";




const appRouter = Router()
appRouter.post("/ask", validateBody(questionsRequestSchema), askQuestion)

export default appRouter