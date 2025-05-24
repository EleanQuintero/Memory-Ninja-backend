export interface IAInterface {
    generateAnswer(tema: string, questions: string[]): Promise<string>
    generateMultipleAnswer(tema: string, questions: string[]): Promise<string[]>
}