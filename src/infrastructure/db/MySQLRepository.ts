import { pool } from "./mysql";
import { UserData } from "../../entities/users/userModel";
import { IUserRepository } from "../../models/interfaces/UserRepository";
import { flashcardData } from "../../models/interfaces/flashcardData";
import {  ResultSetHeader, RowDataPacket } from 'mysql2';


export class MySQLRepository implements IUserRepository {
    async saveUser(user: UserData): Promise<{message: string}> {
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

    async saveFlashcard(data: flashcardData): Promise<{success: boolean, message: string}> {
        const { user_id, theme, question, answer} = data
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
        
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
        
            for (let i = 0; i < question.length; i++) {
                const pregunta = question[i];
                const respuesta = answer[i];
          
                let questionID;
          
                // 3.1. Verificar si la pregunta ya existe para este usuario y tema
                const [existingQuestion] = await connection.execute<RowDataPacket[]>(
                  'SELECT question_id FROM questions WHERE user_id = ? AND question = ? AND theme_id = ?',
                  [user_id, pregunta, themeID],
                );
          
                if (Array.isArray(existingQuestion) && existingQuestion.length > 0) {
                  // Si la pregunta existe, usar su ID
                  questionID = existingQuestion[0].question_id;
                } else {
                  // 3.2. Si la pregunta no existe, insertarla
                  const [qRes] = await connection.execute<ResultSetHeader>(
                    'INSERT INTO questions (user_id, question, theme_id) VALUES (?, ?, ?)',
                    [user_id, pregunta, themeID],
                  );
                  questionID = qRes.insertId;
          
                  // Y ahora insertamos la respuesta solo si la pregunta es nueva.
                  const [aRes] = await connection.execute<ResultSetHeader>(
                    'INSERT INTO answers (question_id, answer_text) VALUES (?, ?)',
                    [questionID, respuesta],
                  );
                  const answerID = aRes.insertId;
          
                  // 5. Relacionar usuario con pregunta (esto puede necesitar ajuste si la pregunta ya existía)
                  await connection.execute(
                    `INSERT INTO users_questions (user_id, question_id) VALUES (?, ?)`,
                    [user_id, questionID],
                  );
          
                  // 6. Insertar en flashcard_data (esto siempre creará una nueva entrada en flashcard_data por cada par pregunta-respuesta en el input, incluso si la pregunta ya existía. Si esto no es deseado, necesitarías una lógica de verificación/actualización aquí también)
                  await connection.execute(
                    `INSERT INTO flashcard_data
                      (question, answer, user_id, theme_id, original_question_id, original_answer_id)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [pregunta, respuesta, user_id, themeID, questionID, answerID],
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


    async getFlashcardsByID(user_id: string): Promise<{ success: boolean; message: string; data: RowDataPacket[]; }> {
        try {
          console.log(user_id)
          const [result] = await pool.query(
            `SELECT fd.question,  fd.answer, t.theme_name AS theme
              FROM flashcard_data fd 
              JOIN themes t ON fd.theme_id = t.theme_id
              WHERE fd.user_id = ?`,
              [user_id],
            )
            return {success: true, message:"Datos obtenidos de forma exitosa", data: result as RowDataPacket[]}
          } catch (error) {
            console.error(error instanceof Error ? error.message : 'Error desconocido' )
            throw new Error(`Error al obtener los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          
        }
    }
}
