export interface IThemeRepository {
    getAllThemes(): Promise<{ success: boolean, message: string, data: string[] }>;
    createTheme(user_id: string, theme_name: string): Promise<{ success: boolean, message: string }>;
    deleteTheme(themeId: string): Promise<{ success: boolean, message: string }>;
}