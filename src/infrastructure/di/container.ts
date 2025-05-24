import { API_KEY } from '../../consts/const'
import { GeminiModel } from '../../ia/GeminiModel'
import { QuestionService } from '../../services/QuestionService'

export function resolveServices(userLevel: string): QuestionService {
    
       const IA_MODEL = new GeminiModel(API_KEY)
    

    return new QuestionService(IA_MODEL)
}
