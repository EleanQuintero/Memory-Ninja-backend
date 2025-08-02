import { Request, Response } from "express"
import { verifyToken } from '@clerk/backend';
import { dashboardService } from "../../infrastructure/di/dashboardContainer"
import { VerifiedToken } from "../../models/interfaces/auth";




export const getCountFlashcardsByTheme = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            res.status(401).json({ message: 'Token de autorización no proporcionado' })
            return
        }

        const verifiedToken = await verifyToken(token, {
            jwtKey: process.env.CLERK_JWT_KEY,
        })

        const tokenData = verifiedToken as unknown as VerifiedToken

        const userLevel = tokenData.pla.split(':')[1]
        console.log('Token:', token)
        console.log('Verified Token:', tokenData)
        console.log('User Level:', userLevel)

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
