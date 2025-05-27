import { pool } from "./mysql";
import { UserData } from "../../models/users/userModel";


export class UserRepository {
    async create(user: UserData): Promise<UserData> {
        const [result] = await pool.query(
            'INSERT INTO users (id, name, lastName, email, role) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.name, user.lastName, user.email, user.role],
    )
    console.log({"Resultado": result})
    return {...user}
    }
}