import { MySQLRepository } from "../db/MySQLRepository.js";
import { ThemeService } from "../../services/themeService.js";

const themeRepository = new MySQLRepository();
export const themeService = new ThemeService(themeRepository);
