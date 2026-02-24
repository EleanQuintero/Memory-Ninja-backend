export const USER_PLANS = {
    FREE: "free_tier",
    PRO_USER: "pro_user",
} as const

export const FREE_TIER_LIMITS = {
    MAX_FLASHCARDS: 25,
    MAX_THEMES: 3,
    MAX_DAILY_AI_GENERATIONS: 3,
    FORCED_MODEL: "Kōga (甲賀)",
} as const