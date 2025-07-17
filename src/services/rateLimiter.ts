import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'

interface limiter {
    minuteDuration: number,
    maxRequest: number
}

export const limiter = ({minuteDuration, maxRequest }: limiter): RateLimitRequestHandler => {

        return rateLimit({
        windowMs: minuteDuration * 60 * 1000,
        max: maxRequest, 
        message: "Too many request. Please try again later", 
        standardHeaders: true,
        legacyHeaders: false,
        })



}