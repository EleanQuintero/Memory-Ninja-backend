import { UserData } from "../../entities/users/userModel";

export interface UserRepository {
   createUser(data: UserData): Promise<{message: string}>
}