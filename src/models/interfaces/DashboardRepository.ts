
export interface IDashboardRepository {
    getCountFlashcardsByTheme(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number }[] }>

    getLastestFlashcardsCreated(user_id: string): Promise<{ success: boolean, message: string, data: { question: string, theme: string, createdAt: string }[] }>

    getMaxFlashcardsByUser(user_id: string): Promise<{ success: boolean, message: string, count: number }>

    getThemeWithMaxFlashcards(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number } }>
}