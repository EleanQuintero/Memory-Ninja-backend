import { UserData } from "../../models/users/userModel";

export interface UserRepository {
   createUser(data: UserData): Promise<{message: string}>
}