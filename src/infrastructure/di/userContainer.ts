
import { UserService } from "../../services/userService";
import { MySQLRepository } from "../db/MySQLRepository";

const userRepository = new MySQLRepository()
export const userService = new UserService(userRepository)