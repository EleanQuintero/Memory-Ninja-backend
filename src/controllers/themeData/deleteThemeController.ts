import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer.js"

export const deleteThemeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        const { themeId } = req.params

        if (!userId) {
            res.status(400).json({ message: "User ID is required" })
            return
        }

        const data = await themeService.deleteTheme(themeId, userId)



        if (!data.success) {
            res.status(404).json({ message: data.message })
            return
        }

        res.status(200).json(data)
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            res.status(500).json({ error: "Error al borrar tema" })
        } else {
            console.error(error)
            res.status(500).json({ error: 'Error desconocido' })
        }
    }
}