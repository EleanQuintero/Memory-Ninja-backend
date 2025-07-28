import { Router } from "express";
import { getCountFlashcardsByTheme } from "../controllers/dashboardData/getCountFlashcardsByTheme";
import { getLastestFlashcardsCreated } from "../controllers/dashboardData/getLastestFlashcardsCreated";

const dashboardRouter = Router()

dashboardRouter.get("/countByTheme/:userId", getCountFlashcardsByTheme)
dashboardRouter.get("/latestFlashcards/:userId", getLastestFlashcardsCreated)

export default dashboardRouter