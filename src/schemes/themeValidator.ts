import { z } from 'zod'

export const themeValidatorSchema = z.object({
    theme_name: z.string().trim().min(5).max(12),
});