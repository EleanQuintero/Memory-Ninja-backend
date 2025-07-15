import { UserData } from "../../entities/users/userModel";
import { flashcardData } from "./flashcardData";
import { flashcard, flashcardToSync } from "../../entities/flashcard/flashCardModel";

export interface IUserRepository {
    saveUser(user: UserData): Promise<{ message: string }>
    saveFlashcard(data: flashcardToSync): Promise<{success: boolean, message: string}>
    getFlashcardsByID(user_id: string): Promise<{success: boolean, message: string, data: flashcard[]}>
    deleteFlashcard(flashcard_id: string, user_id: string): Promise<{success: boolean, message: string}>

}