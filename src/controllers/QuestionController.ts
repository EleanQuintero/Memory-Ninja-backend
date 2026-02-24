import { Response } from 'express'
import { QuestionRequest } from './QuestionsRequest.js'
import { resolveServices } from '../infrastructure/di/container.js'
import { USER_PLANS, FREE_TIER_LIMITS } from '../entities/users/userPlans.js'
import { getDailyGenerationCount, incrementDailyGeneration } from '../infrastructure/redis/upstashClient.js'


export async function askQuestion(req: QuestionRequest, res: Response): Promise<void> {

    try {
        const { tema, questions } = req.body
        let { model } = req.body
        const userLevel = req.user?.userLevel
        const userId = req.user?.id
        console.log('Model selected:', model)

        if (!userLevel) {
            res.status(400).json({ error: "User level is required" })
            return
        }

        if (userLevel === USER_PLANS.FREE) {
            // Force Kōga model for free-tier users
            model = FREE_TIER_LIMITS.FORCED_MODEL

            // Check daily AI generation limit
            const dailyCount = await getDailyGenerationCount(userId!)
            if (dailyCount >= FREE_TIER_LIMITS.MAX_DAILY_AI_GENERATIONS) {
                res.status(403).json({
                    error: "Free plan limit: max 3 AI generations per day",
                    code: "AI_GENERATION_LIMIT_REACHED",
                })
                return
            }
        }

        const service = resolveServices({ model })


        if (questions.length === 1) {
            const answer = await service.handleQuestion(tema, questions)
            if (userLevel === USER_PLANS.FREE) {
                await incrementDailyGeneration(userId!)
            }
            res.json({ answer })
            return
        }

        const answer = await service.handleMultipleQuestion(tema, questions)
        if (userLevel === USER_PLANS.FREE) {
            await incrementDailyGeneration(userId!)
        }
        res.json({ answer })
        return
    } catch (error) {
        console.error("Error completo en askQuestion:", error)
        res.status(500).json({
            error: "Error al procesar la pregunta",
        })
    }
}
