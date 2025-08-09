export interface IThemeRepository {
    getAllThemes(): Promise<{ success: boolean, message: string, data: string[] }>;
    createTheme(name: string): Promise<{ success: boolean, message: string, data: { id: string, name: string } }>;
    deleteTheme(themeId: string): Promise<{ success: boolean, message: string }>;
}