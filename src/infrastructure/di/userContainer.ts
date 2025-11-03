
import { UserService } from "../../services/userService.js";
import { MySQLRepository } from "../db/MySQLRepository.js";

const userRepository = new MySQLRepository()
export const userService = new UserService(userRepository)