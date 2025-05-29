import { UserData } from "../models/users/userModel";
import { MySQLRepository } from "../infrastructure/db/MySQLRepository";

export class UserService {
    constructor(private userRepo: MySQLRepository) {}

    async createUser(data: UserData): Promise<{message: string}> {
        return this.userRepo.create(data)
    }
}