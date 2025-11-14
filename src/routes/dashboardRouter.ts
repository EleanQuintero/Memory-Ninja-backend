import { Router } from "express";
import { getCountFlashcardsByTheme } from "../controllers/dashboardData/getCountFlashcardsByTheme.js";
import { getLastestFlashcardsCreated } from "../controllers/dashboardData/getLastestFlashcardsCreated.js";
import { getMaxFlashcardsByUser } from "../controllers/dashboardData/getMaxFlashcardsByUser.js";
import { getThemeWithMaxFlashcards } from "../controllers/dashboardData/getThemeWithMaxFlashcards.js";

const dashboardRouter = Router()

//todo: agregar validaciones de ID a los endpoints que lo requieran

dashboardRouter.get("/countByTheme/:userId", getCountFlashcardsByTheme)
dashboardRouter.get("/latestFlashcards/:userId", getLastestFlashcardsCreated)
dashboardRouter.get("/maxFlashcards/:userId", getMaxFlashcardsByUser)
dashboardRouter.get("/themeWithMaxFlashcards/:userId", getThemeWithMaxFlashcards)

export default dashboardRouter