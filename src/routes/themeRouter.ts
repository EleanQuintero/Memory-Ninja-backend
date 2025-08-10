import { Router } from "express";
import { getAllThemesController } from "../controllers/themeData/getAllThemesController";
import { deleteThemeController } from "../controllers/themeData/deleteThemeController";
import { createThemeController } from "../controllers/themeData/createThemeController";
import { validateBody } from "../middlewares/validateBody";
import { themeValidatorSchema } from "../schemes/themeValidator";


const themeRouter = Router();

// Endpoint to get all themes for a user
themeRouter.get("/get", getAllThemesController);

// Endpoint to delete a specific theme for a user
themeRouter.delete("/delete/:themeId", deleteThemeController);

// Endpoint to create a new theme for a user
themeRouter.post("/add", validateBody(themeValidatorSchema), createThemeController);


export default themeRouter;
