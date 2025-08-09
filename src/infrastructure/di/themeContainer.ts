import { MySQLRepository } from "../db/MySQLRepository";
import { ThemeService } from "../../services/themeService";

const themeRepository = new MySQLRepository();
export const themeService = new ThemeService(themeRepository);
