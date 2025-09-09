import { Response } from 'express'
import { QuestionRequest } from './QuestionsRequest'
import { resolveServices } from '../infrastructure/di/container'


export async function askQuestion(req: QuestionRequest, res: Response): Promise<void> {

    const { tema, questions, model } = req.body
    const userLevel = req.user?.userLevel
    console.log('Model selected:', model)

    if (!userLevel) {
        res.status(400).json({ error: "User level is required" })
        return
    }

    const service = resolveServices({ userLevel, model })


    if (questions.length === 1) {
        const answer = await service.handleQuestion(tema, questions)
        res.json({ answer })
        return
    }

    const answer = await service.handleMultipleQuestion(tema, questions)
    res.json({ answer })
    return
}
