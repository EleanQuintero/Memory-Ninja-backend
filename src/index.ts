import express, { Request, Response } from 'express'
import questionRouter from './routes/app'
import appRouter from './routes/app'
import userRouter from './routes/userRouter'
import healthRouter from './routes/health'

const PORT: number | string = process.env.PORT ?? 4444
const app = express()

app.use(express.json())
app.disable('x-powered-by')
app.use('/api/questions', appRouter)
app.use('/api/user', userRouter)
app.use('/api/health', healthRouter)

app.get('/', (req: Request, res: Response): void => {
    res.json({mensaje: "Bienvenido al punto de entrada de la API"})
})

/*app.post('/user', async (req: Request, res: Response): Promise<void> => {
    try {
        
        const {id, name, lastName, userName, email, role} = req.body
        console.log("📥 Usuario recibido:", { id, name, lastName, userName, email, role });

        res.status(201).json({ message: "Usuario sincronizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos del usuario' })
    }
})*/

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
  })