import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import appRouter from './routes/app'
import userRouter from './routes/userRouter'
import healthRouter from './routes/health'
import helmet from 'helmet'
import { limiter } from './services/rateLimiter'
import dashboardRouter from './routes/dashboardRouter'
import { validateAuth } from './middlewares/validateAuth'

const PORT: number | string = process.env.PORT ?? 4444
const app = express()
dotenv.config()

//todo: valorar agregar validaciones por API KEY 

app.use(express.json())
app.use(helmet())
app.disable('x-powered-by')
app.use('/api/questions', validateAuth, limiter({ minuteDuration: 1, maxRequest: 5 }), appRouter)
app.use('/api/user', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), userRouter)
app.use('/api/health', validateAuth, limiter({ minuteDuration: 1, maxRequest: 3 }), healthRouter)
app.use('/api/dashboard', validateAuth, limiter({ minuteDuration: 1, maxRequest: 20 }), dashboardRouter)

app.get('/', (req: Request, res: Response): void => {
    res.json({ mensaje: "Bienvenido al punto de entrada de la API" })
})

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})