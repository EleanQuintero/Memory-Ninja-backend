import { flashcard } from "../../entities/flashcard/flashCardModel"

export interface IDashboardRepository {
    getCountFlashcardsByTheme(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number }[] }>

    getLastestFlashcardsCreated(user_id: string): Promise<{ success: boolean, message: string, data: flashcard[] }>

    getMaxFlashcardsByUser(user_id: string): Promise<{ success: boolean, message: string, count: number }>

    getThemeWithMaxFlashcards(user_id: string): Promise<{ success: boolean, message: string, data: { theme: string, count: number } }>
}