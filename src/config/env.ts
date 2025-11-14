
// Validación temprana - el app falla al inicio si faltan variables críticas
if (!process.env.GEMINI_KOGA || !process.env.GEMINI_KURAYAMI) {
    throw new Error('Missing required environment variables: GEMINI_KOGA or GEMINI_KURAYAMI')
}

if (!process.env.API_KEY) {
    throw new Error('Missing required environment variable: API_KEY')
}

if (!process.env.CLERK_JWT_KEY) {
    throw new Error('Missing required environment variable: CLERK_JWT_KEY')
}

interface DatabaseConfig {
    host: string | undefined
    user: string | undefined
    password: string | undefined
    name: string | undefined
    waitForConnections: boolean
    connectionLimit: number
}

interface EnvConfig {
    GEMINI_KOGA: string
    GEMINI_KURAYAMI: string
    API_KEY: string
    GEMINI_API_KEY: string | undefined
    CLERK_JWT_KEY: string
    PORT: string
    AI_MANY_ANSWERS_PROMPT: string | undefined
    AI_ANSWERS_PROMPT: string | undefined
    DB_DATA: DatabaseConfig
}

export const env: EnvConfig = {
    GEMINI_KOGA: process.env.GEMINI_KOGA,
    GEMINI_KURAYAMI: process.env.GEMINI_KURAYAMI,
    API_KEY: process.env.API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CLERK_JWT_KEY: process.env.CLERK_JWT_KEY,
    PORT: process.env.PORT ?? '4444',
    AI_MANY_ANSWERS_PROMPT: process.env.AI_MANY_ANSWERS_PROMPT,
    AI_ANSWERS_PROMPT: process.env.AI_ANSWERS_PROMPT,
    DB_DATA: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
        waitForConnections: process.env.DB_WAIT_FOR_CONNECTION === 'true',
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    },
}
