import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer.js"

export const getThemeStatusController = async (req: Request, res: Response): Promise<void> => {
    try {

        const userId = req.user?.id
        if (!userId) {
            res.status(400).json({ message: "User ID is required" })
            return
        }


        const theme_status = await themeService.getThemeStatus(userId)
        res.status(200).json({ status: theme_status })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
}