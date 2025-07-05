import { Router } from "express";
import { healtCheckController } from "../controllers/healthController";

const healthRouter = Router()

healthRouter.get("/health", healtCheckController)

export default healthRouter