import { RowDataPacket } from "mysql2";
import { UserData } from "../../entities/users/userModel";
import { flashcardData } from "./flashcardData";

export interface IUserRepository {
    saveUser(user: UserData): Promise<{ message: string }>
    saveFlashcard(data: flashcardData): Promise<{success: boolean, message: string}>
    getFlashcardsByID(user_id: string): Promise<{success: boolean, message: string, data: RowDataPacket[]}>
}