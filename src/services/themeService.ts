import { IThemeRepository, themeData } from "../models/interfaces/ThemeRepository.js";

export class ThemeService {

    constructor(private themeRepository: IThemeRepository) { }
    async getAllThemes(user_id: string): Promise<{ success: boolean, message: string, data: themeData[] }> {
        return await this.themeRepository.getAllThemes(user_id);
    }

    async deleteTheme(theme_id: string, user_id: string): Promise<{ success: boolean, message: string }> {
        return await this.themeRepository.deleteTheme(theme_id, user_id);
    }

    async createTheme(user_id: string, theme_name: string): Promise<{ success: boolean, message: string }> {
        return await this.themeRepository.createTheme(user_id, theme_name);
    }

    async updateThemeStatus(user_id: string): Promise<{ success: boolean, message: string }> {
        return await this.themeRepository.updateThemeStatus(user_id);
    }

    async getThemeStatus(user_id: string): Promise<{ success: boolean, message: string, theme_status: string }> {
        return await this.themeRepository.getThemeStatus(user_id);
    }




}