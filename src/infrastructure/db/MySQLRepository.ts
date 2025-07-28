import { pool } from "./mysql";
import { UserData } from "../../entities/users/userModel";
import { IUserRepository } from "../../models/interfaces/UserRepository";
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { flashcard, flashcardToSync } from "../../entities/flashcard/flashCardModel";
import { IDashboardRepository } from "../../models/interfaces/DashboardRepository";


export class MySQLRepository implements IUserRepository, IDashboardRepository {
    async saveUser(user: UserData): Promise<{ message: string }> {
        try {
            const [result] = await pool.query(
                'INSERT INTO users (id, name, lastName, email, role) VALUES (?, ?, ?, ?, ?)',
                [user.id, user.name, user.lastName, user.email, user.role],
            )
            console.log({ "Resultado": result })
            return { message: "Usuario registrado exitosamente" }
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : 'Error desconocido')
            throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async saveFlashcard(data: flashcardToSync): Promise<{ success: boolean, message: string }> {
        const { user_id, flashcard } = data;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const card of flashcard) {
                const { question, answer, theme } = card;

                // 1. Insertar tema si no existe
                const [existingTheme] = await connection.execute<RowDataPacket[]>(
                    'SELECT theme_id FROM themes WHERE theme_name = ?',
                    [theme],
                );
                let themeID;
                if (Array.isArray(existingTheme) && existingTheme.length === 0) {
                    const [themeResult] = await connection.execute<ResultSetHeader>(
                        'INSERT INTO themes (theme_name) VALUES (?)',
                        [theme],
                    );
                    themeID = themeResult.insertId;
                } else {
                    themeID = existingTheme[0].theme_id;
                }

                // 2. Asociar tema al usuario si no existe
                await connection.execute(
                    `INSERT IGNORE INTO user_themes (user_id, theme_id) VALUES (?, ?)`,
                    [user_id, themeID],
                );

                let questionID;

                // 3.1. Verificar si la pregunta ya existe para este usuario y tema
                const [existingQuestion] = await connection.execute<RowDataPacket[]>(
                    'SELECT question_id FROM questions WHERE user_id = ? AND question = ? AND theme_id = ?',
                    [user_id, question, themeID],
                );

                if (Array.isArray(existingQuestion) && existingQuestion.length > 0) {
                    // Si la pregunta existe, usar su ID
                    questionID = existingQuestion[0].question_id;
                } else {
                    // 3.2. Si la pregunta no existe, insertarla
                    const [qRes] = await connection.execute<ResultSetHeader>(
                        'INSERT INTO questions (user_id, question, theme_id) VALUES (?, ?, ?)',
                        [user_id, question, themeID],
                    );
                    questionID = qRes.insertId;

                    // Insertar la respuesta solo si la pregunta es nueva.
                    const [aRes] = await connection.execute<ResultSetHeader>(
                        'INSERT INTO answers (question_id, answer_text) VALUES (?, ?)',
                        [questionID, answer],
                    );
                    const answerID = aRes.insertId;

                    // Relacionar usuario con pregunta
                    await connection.execute(
                        `INSERT INTO users_questions (user_id, question_id) VALUES (?, ?)`,
                        [user_id, questionID],
                    );

                    // Insertar en flashcard_data
                    await connection.execute(
                        `INSERT INTO flashcard_data
                        (question, answer, user_id, theme_id, original_question_id, original_answer_id)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [question, answer, user_id, themeID, questionID, answerID],
                    );
                }
            }

            await connection.commit();
            return { success: true, message: 'Flashcards insertadas correctamente.' };
        } catch (error: unknown) {
            await connection.rollback();
            console.error('Error insertando flashcards:', error);
            return {
                success: false,
                message: `Error insertando flashcards: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            };
        } finally {
            connection.release();
        }
    }


    async getFlashcardsByID(user_id: string): Promise<{ success: boolean; message: string; data: flashcard[]; }> {
        try {
            const hour = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            console.log(`Hora de ejecucion: ${hour}`);
            const [result] = await pool.query<RowDataPacket[]>(
                `SELECT fd.flashcard_id AS flashcard_id, fd.question,  fd.answer, t.theme_name AS theme
              FROM flashcard_data fd 
              JOIN themes t ON fd.theme_id = t.theme_id
              WHERE fd.user_id = ?`,
                [user_id],
            )

            const flashcards = result as flashcard[]

            return { success: true, message: "Datos obtenidos de forma exitosa", data: flashcards }
        } catch (error) {
            console.error(error instanceof Error ? error.message : 'Error desconocido')
            throw new Error(`Error al obtener los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);

        }
    }

    async deleteFlashcard(flashcard_id: string, user_id: string): Promise<{ success: boolean; message: string; }> {
        try {
            const [result] = await pool.query<RowDataPacket[]>(
                `SELECT flashcard_id 
                FROM flashcard_data
                WHERE user_id = ? AND flashcard_id LIKE ?;`,
                [user_id, `${flashcard_id}%`],
            )
            const idToDelete = result[0].flashcard_id

            const [finalResult] = await pool.query<RowDataPacket[]>(
                `DELETE from flashcard_data
                WHERE user_id = ? AND flashcard_id = ?;`,
                [user_id, idToDelete],
            )
            return {
                success: true,
                message: "Flashcard eliminada correctamente",
            }
        } catch (error) {
            return {
                success: false,
                message: "Error al eliminar la flashcard",
            }

        }
    }

    getCountFlashcardsByTheme(user_id: string): Promise<{ success: boolean; message: string; data: { theme: string; count: number; }[]; }> {
        throw new Error("Method not implemented.");
    }
    getLastestFlashcardsCreated(user_id: string): Promise<{ success: boolean; message: string; data: flashcard[]; }> {
        throw new Error("Method not implemented.");
    }
    getMaxFlashcardsByUser(user_id: string): Promise<{ success: boolean; message: string; count: number; }> {
        throw new Error("Method not implemented.");
    }
    getThemeWithMaxFlashcards(user_id: string): Promise<{ success: boolean; message: string; data: { theme: string; count: number; }; }> {
        throw new Error("Method not implemented.");
    }
}
