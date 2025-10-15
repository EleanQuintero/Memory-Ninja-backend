import { Router } from "express";
import { createUserController, deleteUserController } from "../controllers/userDataController";
import { createFlashcardController } from "../controllers/createFlashcardController";
import { getFlashcardController } from "../controllers/getFlashcardsController";
import { deleteFlashcardController } from "../controllers/deleteFlashcardController";
import { validateID } from "../middlewares/validateIDInput";
import { idValidatorSchema } from "../schemes/idValidator";

const userRouter = Router()

userRouter.post("/new", createUserController)
userRouter.post("/flashcard/new", createFlashcardController)
userRouter.get("/flashcard/getByID/:userId", getFlashcardController)
userRouter.delete("/flashcard/delete/:userId/:id", validateID(idValidatorSchema), deleteFlashcardController)


export default userRouter;