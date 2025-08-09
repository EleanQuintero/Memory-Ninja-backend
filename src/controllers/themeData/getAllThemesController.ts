import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer"


export const getAllThemesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const data = await themeService.getAllThemes(userId)

        if (!data.success) {
            res.status(404).json({ message: data.message })
            return
        }

        res.status(200).json(data)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
}