import { Router } from "express";
import { getCountFlashcardsByTheme } from "../controllers/dashboardData/getCountFlashcardsByTheme";
import { getLastestFlashcardsCreated } from "../controllers/dashboardData/getLastestFlashcardsCreated";
import { getMaxFlashcardsByUser } from "../controllers/dashboardData/getMaxFlashcardsByUser";
import { getThemeWithMaxFlashcards } from "../controllers/dashboardData/getThemeWithMaxFlashcards";

const dashboardRouter = Router()

//todo: agregar validaciones de ID a los endpoints que lo requieran

dashboardRouter.get("/countByTheme/:userId", getCountFlashcardsByTheme)
dashboardRouter.get("/latestFlashcards/:userId", getLastestFlashcardsCreated)
dashboardRouter.get("/maxFlashcards/:userId", getMaxFlashcardsByUser)
dashboardRouter.get("/themeWithMaxFlashcards/:userId", getThemeWithMaxFlashcards)

export default dashboardRouter