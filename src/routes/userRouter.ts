import { Router } from "express";
import { createFlashcardController } from "../controllers/createFlashcardController.js";
import { getFlashcardController } from "../controllers/getFlashcardsController.js";
import { deleteFlashcardController } from "../controllers/deleteFlashcardController.js";
import { validateID } from "../middlewares/validateIDInput.js";
import { idValidatorSchema } from "../schemes/idValidator.js";

const userRouter = Router()

userRouter.post("/flashcard/new", createFlashcardController)
userRouter.get("/flashcard/getByID/:userId", getFlashcardController)
userRouter.delete("/flashcard/delete/:userId/:id", validateID(idValidatorSchema), deleteFlashcardController)


export default userRouter;