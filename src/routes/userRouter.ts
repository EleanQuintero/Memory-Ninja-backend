import { Router } from "express";
import { createUserController } from "../controllers/userDataController";
import { createFlashcardController } from "../controllers/createFlashcardController";

const userRouter = Router()

userRouter.post("/new", createUserController)
userRouter.post("/flashcard/new", createFlashcardController)


export default userRouter;