import { UserData } from "../../entities/users/userModel.js";
import { flashcardData } from "./flashcardData.js";
import { flashcard, flashcardToSync } from "../../entities/flashcard/flashCardModel.js";

export interface IUserRepository {
    saveUser(user: UserData): Promise<{ message: string }>
    saveFlashcard(data: flashcardToSync): Promise<{ success: boolean, message: string }>
    getFlashcardsByID(user_id: string): Promise<{ success: boolean, message: string, data: flashcard[] }>
    deleteFlashcard(flashcard_id: string, user_id: string): Promise<{ success: boolean, message: string }>
    deleteUser(user_id: string): Promise<{ message: string }>

}