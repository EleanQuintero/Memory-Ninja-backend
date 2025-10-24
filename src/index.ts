import express from 'express'
import { env } from './config/env'
import appRouter from './routes/app'
import userRouter from './routes/userRouter'
import helmet from 'helmet'
import { limiter } from './services/rateLimiter'
import dashboardRouter from './routes/dashboardRouter'
import { validateAuth } from './middlewares/validateAuth'
import themeRouter from './routes/themeRouter'
import deleteRouter from './routes/deleteUser'

const PORT: number | string = env.PORT
const app = express()
app.use(express.json())
app.use(helmet())
app.disable('x-powered-by')
app.use('/api/questions', validateAuth, limiter({ minuteDuration: 1, maxRequest: 5 }), appRouter)
app.use('/api/user/delete', deleteRouter)
app.use('/api/user', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), userRouter)
app.use('/api/dashboard', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), dashboardRouter)
app.use('/api/themes', validateAuth, limiter({ minuteDuration: 1, maxRequest: 10 }), themeRouter)

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})