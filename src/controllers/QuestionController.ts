import { Response } from 'express'
import { QuestionRequest } from './QuestionsRequest.js'
import { resolveServices } from '../infrastructure/di/container.js'


export async function askQuestion(req: QuestionRequest, res: Response): Promise<void> {

    try {
        const { tema, questions, model } = req.body
        const userLevel = req.user?.userLevel
        console.log('Model selected:', model)

        if (!userLevel) {
            res.status(400).json({ error: "User level is required" })
            return
        }

        const service = resolveServices({ model })


        if (questions.length === 1) {
            const answer = await service.handleQuestion(tema, questions)
            res.json({ answer })
            return
        }

        const answer = await service.handleMultipleQuestion(tema, questions)
        res.json({ answer })
        return
    } catch (error) {
        console.error("Error completo en askQuestion:", error)
        res.status(500).json({
            error: "Error al procesar la pregunta",
        })
    }
}
