import { Router } from "express";
import { createUserController } from "../controllers/userDataController";

const userRouter = Router()

userRouter.post("/new", createUserController)


export default userRouter;