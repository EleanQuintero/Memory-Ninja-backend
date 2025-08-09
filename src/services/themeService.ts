import { IThemeRepository, themeData } from "../models/interfaces/ThemeRepository";

export class ThemeService {

    constructor(private themeRepository: IThemeRepository) { }
    async getAllThemes(user_id: string): Promise<{ success: boolean, message: string, themeDTO: themeData[] }> {
        return await this.themeRepository.getAllThemes(user_id);
    }

    async deleteTheme(theme_id: string, user_id: string): Promise<{ success: boolean, message: string }> {
        return await this.themeRepository.deleteTheme(theme_id, user_id);
    }


}