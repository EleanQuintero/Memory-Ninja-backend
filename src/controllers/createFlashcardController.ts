import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer";

export const createFlashcardController = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = await userService.saveFlashcard(req.body)
        
        res.status(201).json(data)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        } else {
            res.status(500).json({error: 'Ha ocurrido un error desconocido'})
        }
    }
}