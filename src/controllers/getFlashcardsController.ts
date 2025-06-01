import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer";

export const getFlashcardController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        if (!userId) {
            res.status(400).json({ error: 'Se requiere el ID del usuario' });
            return;
        }
        const response = await userService.getFlashCards(userId)
        console.log({success: response.success, message: response.message})
        const data = response.data;
        const flashcardData = {
            theme: data.map(flashcard => flashcard.theme),
            questions: data.map(flashcard => flashcard.question),
            answer: data.map(flashcard => flashcard.answer),

        }

        res.status(201).json(flashcardData)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        } else {
            res.status(500).json({error: 'Ha ocurrido un error desconocido'})
        }
    }
}