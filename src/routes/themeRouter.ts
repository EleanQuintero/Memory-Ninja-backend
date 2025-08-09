import { Router } from "express";
import { getAllThemesController } from "../controllers/themeData/getAllThemesController";
import { deleteThemeController } from "../controllers/themeData/deleteThemeController";
import { createThemeController } from "../controllers/themeData/createThemeController";


const themeRouter = Router();

// Endpoint to get all themes for a user
themeRouter.get("/:userId", getAllThemesController);

// Endpoint to delete a specific theme for a user
themeRouter.delete("/delete/:userId/:themeId", deleteThemeController);

// Endpoint to create a new theme for a user
themeRouter.post("/create/:userId", createThemeController);


export default themeRouter;
