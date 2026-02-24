import { Redis } from "@upstash/redis"
import { env } from "../../config/env.js"

export const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
})

const getTodayDateKey = (): string => {
    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const dd = String(now.getUTCDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

export const getDailyGenerationCount = async (userId: string): Promise<number> => {
    const key = `ai_gen:${userId}:${getTodayDateKey()}`
    const value = await redis.get<number>(key)
    return value ?? 0
}

export const incrementDailyGeneration = async (userId: string): Promise<void> => {
    const key = `ai_gen:${userId}:${getTodayDateKey()}`
    const newCount = await redis.incr(key)
    // Only set expiry on the first increment to avoid resetting the TTL on subsequent calls
    if (newCount === 1) {
        await redis.expire(key, 86400)
    }
}
