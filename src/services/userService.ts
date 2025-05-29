import { UserData } from "../entities/users/userModel";
import { MySQLRepository } from "../infrastructure/db/MySQLRepository";
import { flashcardData } from "../models/interfaces/flashcardData";

export class UserService {
    constructor(private userRepo: MySQLRepository) {}

    async createUser(data: UserData): Promise<{message: string}> {
        return this.userRepo.saveUser(data)
    }

    async saveFlashcard(data: flashcardData): Promise<{success: boolean, message: string}> {
        return this.userRepo.saveFlashcard(data)
    }
}