import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer"

export const createThemeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const { theme_name } = req.body
        console.log(theme_name)

        const data = await themeService.createTheme(userId, theme_name)

        if (!data.success) {
            res.status(400).json({ message: data.message })
            return
        }

        res.status(201).json(data)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
}