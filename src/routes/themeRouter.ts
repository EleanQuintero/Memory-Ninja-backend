import { Router } from "express";
import { getAllThemesController } from "../controllers/themeData/getAllThemesController";


const themeRouter = Router();

// Endpoint to get all themes for a user
themeRouter.get("/:userId", getAllThemesController);

export default themeRouter;
