import { pool } from "./mysql.js";
import { UserData } from "../../entities/users/userModel.js";
import { IUserRepository } from "../../models/interfaces/UserRepository.js";
import { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2';
import { flashcard, flashcardToSync } from "../../entities/flashcard/flashCardModel.js";
import { IDashboardRepository } from "../../models/interfaces/DashboardRepository.js";
import { IThemeRepository, themeData } from "../../models/interfaces/ThemeRepository.js";
import { latestFlashcardsData } from "../../entities/dashboard/dashboardData.js";
import { logger, queryLog } from "../../utils/logger.js";

interface FlashcardRow extends RowDataPacket {
    flashcard_id: string;
    original_question_id: number;
    original_answer_id: number;
}


export class MySQLRepository implements IUserRepository, IDashboardRepository, IThemeRepository {

    /*User Data*/

    async saveUser(user: UserData): Promise<{ message: string }> {
        queryLog('Save user');
        try {
            const [result] = await pool.query(
                'INSERT INTO users (id, email, role, username) VALUES (?, ?, ?, ?)',
                [user.id, user.email, user.role, user.userName],
            )
            logger.log({ "Resultado": result })
            return { message: "Usuario registrado exitosamente" }
        } catch (error: unknown) {
            logger.error(error instanceof Error ? error.message : 'Error desconocido')
            throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
    async deleteUser(userId: string): Promise<{ message: string }> {
        queryLog('Delete user');
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM flashcard_data WHERE user_id = ?', [userId]);
            await connection.query('DELETE FROM questions WHERE user_id = ?', [userId]);
            await connection.query('DELETE FROM user_themes WHERE user_id = ?', [userId]);
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);

            await connection.commit();
            logger.log("Usuario eliminado exitosamente");
            return { message: "Usuario eliminado exitosamente" };
        } catch (error: unknown) {
            await connection.rollback();
            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            connection.release();
        }
    }

    /*Flashcard Data*/

    async saveFlashcard(data: flashcardToSync): Promise<{ success: boolean, message: string }> {
        queryLog('Save flashcard - OPTIMIZED');

        const { user_id, flashcard } = data;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // ═══════════════════════════════════════════════════════════════
            // FASE 1: PRE-CARGA DE DATOS (3 queries en lugar de N×6)
            // ═══════════════════════════════════════════════════════════════

            // 1.1 Obtener todos los theme_id únicos de una sola vez
            const uniqueThemes = [...new Set(flashcard.map(c => c.theme))];
            const [themesRows] = await connection.query<RowDataPacket[]>(
                'SELECT theme_id, theme_name FROM themes WHERE theme_name IN (?)',
                [uniqueThemes],
            );

            // Crear mapa para acceso O(1): theme_name → theme_id
            const themeMap = new Map<string, number>();
            for (const row of themesRows) {
                themeMap.set(row.theme_name, row.theme_id);
            }

            // Validar que todos los temas existen
            for (const themeName of uniqueThemes) {
                if (!themeMap.has(themeName)) {
                    throw new Error(
                        `El tema "${themeName}" no existe. Por favor, créalo primero desde la configuración.`,
                    );
                }
            }

            // 1.2 Obtener todas las preguntas que el usuario ya tiene
            const [userQuestionsRows] = await connection.query<RowDataPacket[]>(
                'SELECT question_id FROM users_questions WHERE user_id = ?',
                [user_id],
            );

            // Crear Set para verificación O(1): ¿el usuario tiene esta pregunta?
            const userQuestionIds = new Set<number>(
                userQuestionsRows.map(row => row.question_id as number),
            );

            // 1.3 Obtener todas las preguntas existentes en los temas relevantes
            const themeIds = [...themeMap.values()];
            const [existingQuestionsRows] = await connection.query<RowDataPacket[]>(
                'SELECT question_id, question, theme_id FROM questions WHERE theme_id IN (?)',
                [themeIds],
            );

            // Crear mapa para acceso O(1): "pregunta|theme_id" → question_id
            const questionMap = new Map<string, number>();
            for (const row of existingQuestionsRows) {
                const key = `${row.question}|${row.theme_id}`;
                questionMap.set(key, row.question_id as number);
            }

            // ═══════════════════════════════════════════════════════════════
            // FASE 2: PROCESAMIENTO EN MEMORIA (sin queries)
            // ═══════════════════════════════════════════════════════════════

            // Arrays para acumular datos de inserción batch
            const newQuestions: [string, string, number][] = [];
            const newAnswers: { questionKey: string; answer: string; isNewQuestion: boolean }[] = [];
            const newUserQuestions: [string, number][] = [];
            const newFlashcards: [string, string, string, number, string, string][] = [];

            // Mapas para tracking temporal de IDs (para preguntas nuevas)
            const tempQuestionIds = new Map<string, number>();
            let tempQuestionIdCounter = -1; // IDs temporales negativos

            for (const card of flashcard) {
                const { question, answer, theme } = card;
                const themeID = themeMap.get(theme)!; // Ya validamos que existe
                const questionKey = `${question}|${themeID}`;

                let questionID = questionMap.get(questionKey);

                if (questionID) {
                    // CASO A: La pregunta ya existe globalmente

                    // Verificar si el usuario ya la tiene
                    if (userQuestionIds.has(questionID)) {
                        throw new Error('Ya tienes esta pregunta guardada');
                    }

                    // Preparar datos para inserción batch
                    newAnswers.push({ questionKey, answer, isNewQuestion: false });
                    newUserQuestions.push([user_id, questionID]);
                    // Guardaremos flashcard_data después con el answer_id real
                    newFlashcards.push([question, answer, user_id, themeID, 'PLACEHOLDER_Q', 'PLACEHOLDER_A']);

                } else {
                    // CASO B: La pregunta NO existe, debemos crearla

                    // Asignar ID temporal para tracking
                    const tempId = tempQuestionIdCounter--;
                    tempQuestionIds.set(questionKey, tempId);

                    // Preparar datos para inserción batch
                    newQuestions.push([user_id, question, themeID]);
                    newAnswers.push({ questionKey, answer, isNewQuestion: true });
                    newUserQuestions.push([user_id, tempId]); // Usará ID temporal por ahora
                    newFlashcards.push([question, answer, user_id, themeID, 'PLACEHOLDER_Q', 'PLACEHOLDER_A']);
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // FASE 3: INSERCIÓN BATCH (4-6 queries en total)
            // ═══════════════════════════════════════════════════════════════

            // 3.1 Insertar preguntas nuevas en batch
            let insertedQuestionIds: number[] = [];
            if (newQuestions.length > 0) {
                const [result] = await connection.query<ResultSetHeader>(
                    'INSERT INTO questions (user_id, question, theme_id) VALUES ?',
                    [newQuestions],
                );

                // MySQL retorna el primer insertId, los demás son consecutivos
                const firstId = result.insertId;
                insertedQuestionIds = Array.from(
                    { length: newQuestions.length },
                    (_, i) => firstId + i,
                );

                // Actualizar questionMap con las nuevas preguntas
                for (let i = 0; i < newQuestions.length; i++) {
                    const [userId, question, themeId] = newQuestions[i];
                    const key = `${question}|${themeId}`;
                    questionMap.set(key, insertedQuestionIds[i]);
                }
            }

            // 3.2 Preparar datos de respuestas con question_id reales
            const answersToInsert: [number, string][] = [];
            const answerMetadata: { flashcardIndex: number; questionKey: string }[] = [];

            let flashcardIndex = 0;
            for (const answerData of newAnswers) {
                const realQuestionId = questionMap.get(answerData.questionKey)!;
                answersToInsert.push([realQuestionId, answerData.answer]);
                answerMetadata.push({ flashcardIndex, questionKey: answerData.questionKey });
                flashcardIndex++;
            }

            // 3.3 Insertar respuestas en batch
            let insertedAnswerIds: number[] = [];
            if (answersToInsert.length > 0) {
                const [result] = await connection.query<ResultSetHeader>(
                    'INSERT INTO answers (question_id, answer_text) VALUES ?',
                    [answersToInsert],
                );

                const firstId = result.insertId;
                insertedAnswerIds = Array.from(
                    { length: answersToInsert.length },
                    (_, i) => firstId + i,
                );
            }

            // 3.4 Preparar users_questions con IDs reales
            const userQuestionsToInsert: [string, number][] = [];
            for (const [userId, questionId] of newUserQuestions) {
                if (questionId < 0) {
                    // Era un ID temporal, buscar el real
                    const realId = insertedQuestionIds[Math.abs(questionId) - 1];
                    userQuestionsToInsert.push([userId, realId]);
                } else {
                    // Ya era un ID real
                    userQuestionsToInsert.push([userId, questionId]);
                }
            }

            // 3.5 Insertar users_questions en batch
            if (userQuestionsToInsert.length > 0) {
                await connection.query(
                    'INSERT INTO users_questions (user_id, question_id) VALUES ?',
                    [userQuestionsToInsert],
                );
            }

            // 3.6 Preparar flashcard_data con IDs reales
            const flashcardsToInsert: [string, string, string, number, number, number][] = [];
            for (let i = 0; i < newFlashcards.length; i++) {
                const [question, answer, userId, themeId, _, __] = newFlashcards[i];
                const metadata = answerMetadata[i];
                const realQuestionId = questionMap.get(metadata.questionKey)!;
                const realAnswerId = insertedAnswerIds[i];

                flashcardsToInsert.push([
                    question,
                    answer,
                    userId,
                    themeId,
                    realQuestionId,
                    realAnswerId,
                ]);
            }

            // 3.7 Insertar flashcard_data en batch
            if (flashcardsToInsert.length > 0) {
                await connection.query(
                    `INSERT INTO flashcard_data 
                    (question, answer, user_id, theme_id, original_question_id, original_answer_id) 
                    VALUES ?`,
                    [flashcardsToInsert],
                );
            }

            await connection.commit();
            return { success: true, message: 'Flashcards insertadas correctamente.' };

        } catch (error: unknown) {
            await connection.rollback();
            logger.error('Error insertando flashcards:', error);
            return {
                success: false,
                message: `Error insertando flashcards: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            };
        } finally {
            connection.release();
        }
    }

    async getFlashcardsByID(user_id: string): Promise<{ success: boolean; message: string; data: flashcard[]; }> {
        queryLog('Get flashcards by ID');
        try {
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
            logger.error(error instanceof Error ? error.message : 'Error desconocido')
            throw new Error(`Error al obtener los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);

        }
    }

    async deleteFlashcard(flashcard_id: string, user_id: string): Promise<{ success: boolean; message: string; }> {
        queryLog('Delete flashcard');
        const connection = await pool.getConnection();
        try {

            await connection.beginTransaction();

            const [rows, fields]: [FlashcardRow[], FieldPacket[]] = await connection.execute(
                `SELECT flashcard_id, original_question_id, original_answer_id
                FROM flashcard_data
                WHERE user_id = ? AND flashcard_id LIKE ?;`,
                [user_id, `${flashcard_id}%`],
            );

            if (rows.length === 0) {
                throw new Error('Flashcard no encontrada');
            }


            const idToDelete = rows[0].flashcard_id;
            const original_question_id = rows[0].original_question_id;
            const original_answer_id = rows[0].original_answer_id;

            await connection.execute(
                `DELETE FROM users_questions 
                WHERE user_id = ? AND question_id = ?;`,
                [user_id, original_question_id],
            );

            await connection.execute(
                `DELETE FROM flashcard_data 
                WHERE user_id = ? AND flashcard_id = ?;`,
                [user_id, idToDelete],
            );

            await connection.commit();

            return {
                success: true,
                message: "Flashcard eliminada correctamente",
            }
        } catch (error) {
            await connection.rollback();
            return {
                success: false,
                message: "Error al eliminar la flashcard",
            }
        } finally {
            connection.release();
        }
    }

    /*Dashboard Data*/

    async getCountFlashcardsByTheme(user_id: string): Promise<{ success: boolean; message: string; data: { theme: string; count: number; }[]; }> {
        queryLog('Get count flashcards by theme');
        try {
            const [result] = await pool.query<RowDataPacket[]>(`
                SELECT t.theme_name,                   
                COUNT(f.flashcard_id) AS flashcard_count 
                FROM flashcard_data f         
                JOIN themes t ON f.theme_id = t.theme_id 
                WHERE f.user_id = ?   
                GROUP BY f.user_id, t.theme_id 
                ORDER BY flashcard_count DESC;
                `, [user_id],
            )

            if (!result || result.length === 0) {
                return {
                    success: true,
                    message: "El usuario aún no tiene flashcards creadas",
                    data: [],
                }
            }

            const data = result.map(row => ({
                theme: row.theme_name as string,
                count: row.flashcard_count as number,
            }))

            return { success: true, message: "datos obtenidos exitosamente", data: data }
        } catch (error) {
            logger.error(error instanceof Error ? error.message : 'Error desconocido')
            return {
                success: false,
                message: `Error al obtener el conteo de flashcards por tema`,
                data: [],
            }
        }
    }

    async getLastestFlashcardsCreated(user_id: string): Promise<{ success: boolean; message: string; data: { question: string, theme: string, createdAt: string }[]; }> {
        queryLog('Get latest flashcards created');
        try {
            const [result] = await pool.query<latestFlashcardsData[]>(`
                SELECT f.question, t.theme_name, f.created_at 
                FROM flashcard_data f
                JOIN themes t ON f.theme_id = t.theme_id 
                JOIN users u ON f.user_id = u.id        
                WHERE u.id = ?
                ORDER BY f.created_at DESC
                LIMIT 4;
                `, [user_id])


            if (!result || result.length === 0) {
                return {
                    success: true,
                    message: "El usuario aún no tiene flashcards creadas",
                    data: [],
                }
            }

            const data = result.map(row => ({
                question: row.question,
                theme: row.theme_name,
                createdAt: row.created_at.toLocaleDateString(),
            }))

            return {
                success: true,
                message: "datos obtenidos de forma exitosa",
                data: data,
            }

        } catch (error) {
            logger.error(error)
            return {
                success: false,
                message: "Error al obtener los datos",
                data: [],
            }

        }
    }

    async getMaxFlashcardsByUser(user_id: string): Promise<{ success: boolean; message: string; count: number; }> {
        queryLog('Get max flashcards by user');
        try {
            const [result] = await pool.query<RowDataPacket[]>(`
                SELECT f.user_id,
                COUNT(f.flashcard_id) AS flashcard_count 
                FROM flashcard_data f   
                WHERE f.user_id = ?   
                GROUP BY f.user_id;
                `, [user_id])


            if (!result || result.length === 0) {
                return {
                    success: true,
                    message: "El usuario aún no tiene flashcards creadas",
                    count: 0,
                }
            }


            const data = result.map(row => ({
                count: row.flashcard_count as number,
            }))

            return { success: true, message: "datos obtenidos de forma exitosa", count: data[0].count }
        } catch (error) {
            logger.error(error)
            return {
                success: false,
                message: "Error al obtener los datos",
                count: 0,
            }
        }
    }

    async getThemeWithMaxFlashcards(user_id: string): Promise<{ success: boolean; message: string; data: { theme: string; count: number; }; }> {
        queryLog('Get theme with max flashcards');
        try {
            const [result] = await pool.query<RowDataPacket[]>(`
                SELECT t.theme_name,                   
                COUNT(f.flashcard_id) AS flashcard_count 
                FROM flashcard_data f   
                JOIN themes t ON f.theme_id = t.theme_id 
                WHERE f.user_id = ?
                GROUP BY t.theme_id 
                order by flashcard_count desc
                LIMIT 1;
                `, [user_id])


            if (!result || result.length === 0) {
                return {
                    success: true,
                    message: "El usuario aún no tiene flashcards creadas",
                    data: {
                        theme: "Sin temas disponibles",
                        count: 0,
                    },
                }
            }

            const data = result.map(row => ({
                theme: row.theme_name as string,
                count: row.flashcard_count as number,
            }))

            return {
                success: true,
                message: "Datos obtenidos de forma exitosa",
                data: data[0],
            }

        } catch (error) {

            logger.error(error)
            return {
                success: false,
                message: "Error al obtener los datos",
                data: {
                    theme: "",
                    count: 0,
                },
            }

        }
    }


    /*Theme Data*/

    async createTheme(user_id: string, theme_name: string): Promise<{ success: boolean; message: string }> {
        queryLog('Create theme');
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(
                `INSERT INTO themes (theme_name)
                VALUES (?)
                ON DUPLICATE KEY UPDATE theme_id = LAST_INSERT_ID(theme_id);` ,
                [theme_name],
            );
            await connection.execute(`
                INSERT INTO user_themes (user_id, theme_id)
                VALUES (?, LAST_INSERT_ID())`,
                [user_id],
            );

            await connection.commit();
            return { success: true, message: "Tema creado exitosamente" };
        }
        catch (error: unknown) {
            await connection.rollback();
            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            return { success: false, message: `Error al crear el tema` };
        } finally {
            connection.release();
        }
    }

    async getAllThemes(user_id: string): Promise<{ success: boolean; message: string; data: themeData[] }> {
        queryLog('Get all themes');
        try {
            const [result] = await pool.query<RowDataPacket[]>(
                `SELECT 
                    t.theme_id,t.theme_name
                FROM users u
                JOIN user_themes ut 
                    ON u.id = ut.user_id
                JOIN themes t 
                    ON ut.theme_id = t.theme_id
                WHERE u.id = ?;`,
                [user_id],
            );

            const data: themeData[] = result.map(row => ({
                themeId: row.theme_id as string,
                themeName: row.theme_name as string,
            }));

            return { success: true, message: "Datos obtenidos de forma exitosa", data };
        } catch (error) {
            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            return { success: false, message: `Error al obtener los temas`, data: [] };
        }
    }


    async deleteTheme(themeId: string, user_id: string): Promise<{ success: boolean; message: string; }> {
        queryLog('Delete theme');
        try {
            await pool.query(
                `DELETE 
                FROM user_themes 
                WHERE user_id = ? AND theme_id = ?;`,
                [user_id, themeId],
            );

            return { success: true, message: "Tema eliminado exitosamente" };
        } catch (error) {
            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            return {
                success: false,
                message: `Error al eliminar el tema`,
            }
        }
    }


    async updateThemeStatus(user_id: string): Promise<{ success: boolean; message: string; }> {
        queryLog('Update theme status');
        try {
            await pool.query(
                `UPDATE users SET theme_setup = true 
                WHERE users.id = ? ; `,
                [user_id],
            );

            return { success: true, message: "Estado de tema actualizado" };
        } catch (error) {
            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            return {
                success: false,
                message: `Error al actualizar el estado del tema`,
            }
        }
    }

    async getThemeStatus(user_id: string): Promise<{ success: boolean; message: string; theme_status: string; }> {
        queryLog('Get theme status');
        try {
            const [result] = await pool.query<RowDataPacket[]>(`
                SELECT theme_setup from users 
                WHERE users.id = ?;`,
                [user_id])

            const theme_status = result[0]

            return { success: true, message: "Estado de tema obtenido exitosamente", theme_status: theme_status.theme_setup };
        } catch (error) {

            logger.error(error instanceof Error ? error.message : 'Error desconocido');
            return {
                success: false,
                message: `Error al obtener el estado del tema`,
                theme_status: '',
            }

        }



    }

}


