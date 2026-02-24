import { Request, Response } from "express";
import { userService } from "../infrastructure/di/userContainer.js";
import { logger } from "../utils/logger.js";
import { USER_PLANS, FREE_TIER_LIMITS } from "../entities/users/userPlans.js";

export const createFlashcardController = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.userLevel === USER_PLANS.FREE) {
            const userId: string = req.body.user_id
            const existingCount = await userService.getFlashcardCount(userId)

            if (existingCount + req.body.flashcard.length > FREE_TIER_LIMITS.MAX_FLASHCARDS) {
                res.status(403).json({
                    error: "Free plan limit: max 25 flashcards",
                    code: "FLASHCARD_LIMIT_REACHED",
                })
                return
            }
        }

        const data = await userService.saveFlashcard(req.body)

        res.status(201).json(data)
        logger.log("flashcard creada")
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Ha ocurrido un error desconocido' })
        }
    }
}