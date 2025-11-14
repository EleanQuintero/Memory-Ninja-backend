import { MySQLRepository } from "../db/MySQLRepository.js";
import { DashboardService } from "../../services/dashBoardService.js";

const dashboardRepository = new MySQLRepository()
export const dashboardService = new DashboardService(dashboardRepository)