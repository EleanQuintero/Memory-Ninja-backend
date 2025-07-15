import { z } from 'zod'

export const idValidatorSchema = z.object({
    id: z.string().min(8, "El ID debe tener al menos 8 caracteres").max(8, "El ID debe tener como máximo 8 caracteres"),
})