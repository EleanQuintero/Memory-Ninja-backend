import { Request, Response } from "express"
import { dashboardService } from "../../infrastructure/di/dashboardContainer.js"




export const getCountFlashcardsByTheme = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const data = await dashboardService.getCountFlashcardsByTheme(userId)

        if (!data.success) {
            res.status(404).json({ message: data.message })
            return
        }

        res.status(200).json(data)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Ha ocurrido un error desconocido' })
        }

    }

}
