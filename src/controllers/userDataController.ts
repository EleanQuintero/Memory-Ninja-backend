import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer";

export const createUserController = async (req: Request, res: Response) => {
    try {

        const user = await userService.createUser(req.body)
        
        res.status(201).json(user)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        } else {
            res.status(500).json({error: 'Ha ocurrido un error desconocido'})
        }
    }
}