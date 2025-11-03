import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer.js";

export const createUserController = async (req: Request, res: Response): Promise<void> => {
    try {

        const user = await userService.createUser(req.body)

        res.status(201).json(user)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Ha ocurrido un error desconocido' })
        }
    }
}

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params
        const result = await userService.deleteUser(user_id)
        res.status(200).json(result)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Ha ocurrido un error desconocido' })
        }
    }
}