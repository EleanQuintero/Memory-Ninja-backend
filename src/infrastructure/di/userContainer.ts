import { UserRepository } from "../db/userRepository";
import { UserService } from "../../services/userService";

const userRepository = new UserRepository()
export const userService = new UserService(userRepository)