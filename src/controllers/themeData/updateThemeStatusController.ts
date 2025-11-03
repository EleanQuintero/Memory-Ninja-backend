import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer.js"

export const updateThemeStatusController = async (req: Request, res: Response): Promise<void> => {
    try {

        const userId = req.user?.id
        if (!userId) {
            res.status(400).json({ message: "User ID is required" })
            return
        }

        await themeService.updateThemeStatus(userId)
        console.log("Theme status updated successfully for user:", userId);
        res.status(200).json({ message: "Theme status updated successfully" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
}