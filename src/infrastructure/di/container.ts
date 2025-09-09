import { API_KEY } from '../../consts/const'
import { models } from '../../entities/models/models'
import { GeminiModel } from '../../ia/GeminiModel'
import { GPTmini } from '../../ia/gpt5/GPT5Model'
import { QuestionService } from '../../services/QuestionService'

interface serviceProps {
    userLevel: string
    model: string

}

export function resolveServices({ userLevel, model }: serviceProps): QuestionService {

    if (model === "Kōga (甲賀)") {
        const IA_MODEL = new GeminiModel(API_KEY)
        return new QuestionService(IA_MODEL)
    }

    if (model === "Kurayami (暗闇)") {
        const IA_MODEL = new GPTmini()
        return new QuestionService(IA_MODEL)
    }

    // Default model
    const IA_MODEL = new GeminiModel(API_KEY)
    return new QuestionService(IA_MODEL)



}
