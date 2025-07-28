import { MySQLRepository } from "../db/MySQLRepository";
import { DashboardService } from "../../services/dashBoardService";

const dashboardRepository = new MySQLRepository()
export const dashboardService = new DashboardService(dashboardRepository)