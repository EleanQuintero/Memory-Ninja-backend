import { UserData } from "../../entities/users/userModel.js";

export interface UserRepository {
   createUser(data: UserData): Promise<{message: string}>
}