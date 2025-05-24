import  { Response } from 'express'
import { QuestionRequest } from './QuestionsRequest'
import { resolveServices } from '../infrastructure/di/container'



export async function askQuestion(req: QuestionRequest , res: Response): Promise<void> {

   const {tema, questions, userLevel } = req.body
    const service = resolveServices(userLevel)

    if(questions.length === 1) {
        const answer = await service.handleQuestion(tema, questions)
        res.json({answer})
        return
    }

    const answer = await service.handleMultipleQuestion(tema, questions)
    res.json({answer})
    return
}
