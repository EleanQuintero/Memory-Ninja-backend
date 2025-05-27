import { UserData } from "../models/users/userModel";
import { UserRepository } from "../infrastructure/db/userRepository";

export class UserService {
    constructor(private userRepo: UserRepository) {}

    async createUser(data: UserData): Promise<UserData> {
        return this.userRepo.create(data)
    }
}