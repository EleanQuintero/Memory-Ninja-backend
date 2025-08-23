export interface themeData {
    themeId: string;
    themeName: string;
}

export interface IThemeRepository {
    getAllThemes(user_id: string): Promise<{ success: boolean, message: string, data: themeData[] }>;
    createTheme(user_id: string, theme_name: string): Promise<{ success: boolean, message: string }>;
    deleteTheme(themeId: string, user_id: string): Promise<{ success: boolean, message: string }>;
    updateThemeStatus(user_id: string): Promise<{ success: boolean, message: string }>;
    getThemeStatus(user_id: string): Promise<{ success: boolean, message: string, theme_status: string }>;
}