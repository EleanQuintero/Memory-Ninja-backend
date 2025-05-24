import { IAInterface } from "../ia/IAInterface";

export class QuestionService {
    constructor(private iaModel: IAInterface) {}

    async handleQuestion(tema: string, pregunta: string[]): Promise<string> {
        try {
            const answer = await this.iaModel.generateAnswer(tema, pregunta)
            return answer
        } catch (error) {
            throw new Error("Error al procesar la pregunta")
        }
    }

    async handleMultipleQuestion(tema: string, pregunta: string[]): Promise<string[]> {
        try {
            const answer = await this.iaModel.generateMultipleAnswer(tema, pregunta)
            return answer
        } catch (error) {
            throw new Error("Error al procesar la pregunta")
        }
    }
}