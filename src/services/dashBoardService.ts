import { IDashboardRepository } from "../models/interfaces/DashboardRepository.js";

export class DashboardService {
    constructor(private dashboardRepository: IDashboardRepository) { }
    async getCountFlashcardsByTheme(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number }[] }> {
        return await this.dashboardRepository.getCountFlashcardsByTheme(user_id)
    }

    async getLastestFlashcardsCreated(user_id: string): Promise<{ success: boolean, message: string, data: { question: string, theme: string, createdAt: string }[] }> {
        return await this.dashboardRepository.getLastestFlashcardsCreated(user_id)
    }

    async getMaxFlashcardsByUser(user_id: string): Promise<{ success: boolean, message: string, count: number }> {
        return await this.dashboardRepository.getMaxFlashcardsByUser(user_id)
    }

    async getThemeWithMaxFlashcards(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number } }> {
        return await this.dashboardRepository.getThemeWithMaxFlashcards(user_id)
    }
}