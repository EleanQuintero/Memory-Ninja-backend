import { Router } from "express";
import { getCountFlashcardsByTheme } from "../controllers/dashboardData/getCountFlashcardsByTheme";

const dashboardRouter = Router()

dashboardRouter.get("/countByTheme/:userId", getCountFlashcardsByTheme)

export default dashboardRouter