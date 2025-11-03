import { Router } from "express";
import { getAllThemesController } from "../controllers/themeData/getAllThemesController.js";
import { deleteThemeController } from "../controllers/themeData/deleteThemeController.js";
import { createThemeController } from "../controllers/themeData/createThemeController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { themeValidatorSchema } from "../schemes/themeValidator.js";
import { getThemeStatusController } from "../controllers/themeData/getThemeStatusController.js";
import { updateThemeStatusController } from "../controllers/themeData/updateThemeStatusController.js";


const themeRouter = Router();

// Endpoint to get all themes for a user
themeRouter.get("/get", getAllThemesController);

// Endpoint to delete a specific theme for a user
themeRouter.delete("/delete/:themeId", deleteThemeController);

// Endpoint to create a new theme for a user
themeRouter.post("/add", validateBody(themeValidatorSchema), createThemeController);

themeRouter.get("/theme-status", getThemeStatusController);
themeRouter.post("/update-theme-status", updateThemeStatusController);


export default themeRouter;
