import { z } from 'zod'

export const questionsRequestSchema = z.object({
    questions: z.array(z.string().trim().min(5).max(2000)).min(1).max(5),
    tema: z.string().trim().min(3).max(12),
    model: z.string().trim().min(3).max(20),
})


