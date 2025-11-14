import express from 'express'
import { env } from './config/env.js'
import appRouter from './routes/app.js'
import userRouter from './routes/userRouter.js'
import helmet from 'helmet'
import { limiter } from './services/rateLimiter.js'
import dashboardRouter from './routes/dashboardRouter.js'
import { validateAuth } from './middlewares/validateAuth.js'
import themeRouter from './routes/themeRouter.js'
import deleteRouter from './routes/deleteUser.js'
import createUserRouter from './routes/createUser.js'

const PORT: number | string = env.PORT
const app = express()
app.use(express.json())
app.use(helmet())
app.disable('x-powered-by')
app.use('/api/questions', validateAuth, limiter({ minuteDuration: 1, maxRequest: 5 }), appRouter)
app.use('/api/user/create', createUserRouter)
app.use('/api/user/delete', deleteRouter)
app.use('/api/user', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), userRouter)
app.use('/api/dashboard', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), dashboardRouter)
app.use('/api/themes', validateAuth, limiter({ minuteDuration: 1, maxRequest: 10 }), themeRouter)

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})