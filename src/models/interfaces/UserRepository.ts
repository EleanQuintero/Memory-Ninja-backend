import { UserData } from "../../entities/users/userModel";
import { flashcardData } from "./flashcardData";

export interface IUserRepository {
    saveUser(user: UserData): Promise<{ message: string }>
    saveFlashcard(data: flashcardData): Promise<{success: boolean, message: string}>
}