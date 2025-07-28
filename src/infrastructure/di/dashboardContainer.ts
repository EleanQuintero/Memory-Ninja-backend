import { MySQLRepository } from "../db/MySQLRepository";
import { DashboardService } from "../../services/DashboardService";

const dashboardRepository = new MySQLRepository()
export const dashboardService = new DashboardService(dashboardRepository)