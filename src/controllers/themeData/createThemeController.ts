import { Request, Response } from "express"
import { themeService } from "../../infrastructure/di/themeContainer.js"
import { USER_PLANS, FREE_TIER_LIMITS } from "../../entities/users/userPlans.js"

export const createThemeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        const { theme_name } = req.body

        if (!userId) {
            res.status(400).json({ message: "User ID is required" })
            return
        }

        if (req.user?.userLevel === USER_PLANS.FREE) {
            const themesResult = await themeService.getAllThemes(userId)

            if (themesResult.data.length >= FREE_TIER_LIMITS.MAX_THEMES) {
                res.status(403).json({
                    error: "Free plan limit: max 3 themes",
                    code: "THEME_LIMIT_REACHED",
                })
                return
            }
        }

        const data = await themeService.createTheme(userId, theme_name)

        if (!data.success) {
            res.status(400).json({ message: data.message })
            return
        }

        res.status(201).json(data)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred' })
        }
    }
}