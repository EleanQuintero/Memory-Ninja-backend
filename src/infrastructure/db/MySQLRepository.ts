import { pool } from "./mysql";
import { UserData } from "../../models/users/userModel";


export class MySQLRepository {
    async create(user: UserData): Promise<{message: string}> {
        try {
            const [result] = await pool.query(
                'INSERT INTO users (id, name, lastName, email, role) VALUES (?, ?, ?, ?, ?)',
            [user.id, user.name, user.lastName, user.email, user.role],
        ) 
        console.log({"Resultado": result})
        return {message: "Usuario registrado exitosamente"}
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : 'Error desconocido' )
            throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}