import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit'
import { Request } from 'express'

interface limiter {
    minuteDuration: number,
    maxRequest: number
}

const USER_PLANS = {
    FREE: "free_tier",
    PRO_USER: "pro_user",
} as const


export const limiter = ({ minuteDuration, maxRequest }: limiter): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: minuteDuration * 60 * 1000,
        max: (req: Request) => {
            if (req.user?.userLevel === USER_PLANS.PRO_USER) {
                return maxRequest * 2;
            }
            return maxRequest;
        },
        keyGenerator: (req: Request) => {
            const userId = req.user?.id || req.ip
            console.log(userId)
            return `${userId}/LEVEL:${req.user?.userLevel}/PATH:${req.path}`
        },
        message: "Too many request. Please try again later",
        standardHeaders: true,
        legacyHeaders: false,
    })



}