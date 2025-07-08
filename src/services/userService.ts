import { UserData } from "../entities/users/userModel";
import { MySQLRepository } from "../infrastructure/db/MySQLRepository";
import { flashcardData } from "../models/interfaces/flashcardData";
import { flashcard, flashcardToSync } from "../entities/flashcard/flashCardModel";

export class UserService {
    constructor(private userRepo: MySQLRepository) {}

    async createUser(data: UserData): Promise<{message: string}> {
        return this.userRepo.saveUser(data)
    }

    async saveFlashcard(data: flashcardToSync): Promise<{success: boolean, message: string}> {
        return this.userRepo.saveFlashcard(data)
    }

    async getFlashCards(userID: string): Promise<{ success: boolean; message: string; data: flashcard[]; }> {
        return this.userRepo.getFlashcardsByID(userID)
    }
}