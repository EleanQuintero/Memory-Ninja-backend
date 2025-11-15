import { Router } from "express";
import { createUserController } from "../controllers/userDataController.js";

const createUserRouter = Router()

createUserRouter.post("/new", createUserController)

export default createUserRouter;