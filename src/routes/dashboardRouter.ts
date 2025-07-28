import { Router } from "express";
import { getCountFlashcardsByTheme } from "../controllers/dashboardData/getCountFlashcardsByTheme";
import { getLastestFlashcardsCreated } from "../controllers/dashboardData/getLastestFlashcardsCreated";
import { getMaxFlashcardsByUser } from "../controllers/dashboardData/getMaxFlashcardsByUser";

const dashboardRouter = Router()

dashboardRouter.get("/countByTheme/:userId", getCountFlashcardsByTheme)
dashboardRouter.get("/latestFlashcards/:userId", getLastestFlashcardsCreated)
dashboardRouter.get("/maxFlashcards/:userId", getMaxFlashcardsByUser)

export default dashboardRouter