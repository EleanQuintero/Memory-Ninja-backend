import { Router } from "express";
import { deleteUserController } from "../controllers/userDataController";


const deleteRouter = Router()

deleteRouter.delete("/:user_id", deleteUserController)

export default deleteRouter;