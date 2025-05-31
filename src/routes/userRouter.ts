import { Router } from "express";
import { createUserController } from "../controllers/userDataController";
import { createFlashcardController } from "../controllers/createFlashcardController";
import { getFlashcardController } from "../controllers/getFlashcardsController";

const userRouter = Router()

userRouter.post("/new", createUserController)
userRouter.post("/flashcard/new", createFlashcardController)
userRouter.get("/flashcard/getByID",getFlashcardController )


export default userRouter;