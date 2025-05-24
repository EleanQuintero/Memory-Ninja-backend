import express, { Request, Response } from 'express'
import questionRouter from './routes/app'

const PORT: number | string = process.env.PORT ?? 4444
const app = express()



app.use(express.json())
app.disable('x-powered-by')
app.use('/api/questions', questionRouter)

app.get('/', (req: Request, res: Response): void => {
    res.json({mensaje: "Bienvenido al punto de entrada de la API"})
})


app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
  })