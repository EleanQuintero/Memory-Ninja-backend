import { env } from '../../config/env'
import { GeminiModel } from '../../ia/GeminiModel'
import { QuestionService } from '../../services/QuestionService'

interface serviceProps {
    model: string
}

const kogaModelName = env.GEMINI_KOGA
const kurayamiModelName = env.GEMINI_KURAYAMI
const API_KEY = env.GEMINI_API_KEY

export function resolveServices({ model }: serviceProps): QuestionService {

    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables")
    }

    if (!kogaModelName || !kurayamiModelName) {
        throw new Error("Model names are not defined in environment variables")
    }

    if (model === "Kōga (甲賀)") {
        const IA_MODEL = new GeminiModel(API_KEY, kogaModelName)
        return new QuestionService(IA_MODEL)
    }

    if (model === "Kurayami (暗闇)") {
        const IA_MODEL = new GeminiModel(API_KEY, kurayamiModelName)
        return new QuestionService(IA_MODEL)
    }

    // Default model
    const IA_MODEL = new GeminiModel(API_KEY, kogaModelName)
    return new QuestionService(IA_MODEL)



}
