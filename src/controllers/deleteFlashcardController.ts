import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer.js";

export const deleteFlashcardController =  async (req: Request, res: Response):  Promise<void> => {
    try {
        const { id, userId } = req.params
        if(!id) {
            throw new Error("Falta el id de la flashcard")
        }
        if(!userId) {
            throw new Error("Falta el id del usuario")
        }

        const response = await userService.deleteFlashcard(id.toString(), userId.toString())
        if(!response.success) {
            console.log(response.message)
            throw new Error("Error al eliminar la flashcard")
        }

        res.status(201).json(response.message)
        return
    } catch (error) {
        console.log(error)
         res.status(500).json({error: "Error al eliminar la flashcard"})
        return
    }
}