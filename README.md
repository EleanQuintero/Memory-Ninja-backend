# 🎴 Flashcards API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

Backend de alto rendimiento para la generación inteligente y gestión de flashcards educativas usando IA (Google Gemini) con **Arquitectura Hexagonal**, desarrollado en TypeScript + Express con **módulos ESM puros**.

---

## 📋 Tabla de Contenidos

1. [🎯 Características Principales](#-características-principales)
2. [🏗️ Arquitectura Hexagonal](#️-arquitectura-hexagonal)
3. [🔌 Inyección de Dependencias](#-inyección-de-dependencias)
4. [🤖 Integración con IA](#-integración-con-ia)
5. [✅ Validación de Datos](#-validación-de-datos)
6. [🔐 Seguridad y Rate Limiting](#-seguridad-y-rate-limiting)
7. [🗄️ Base de Datos](#️-base-de-datos)
8. [📁 Estructura del Proyecto](#-estructura-del-proyecto)
9. [⚙️ Variables de Entorno](#️-variables-de-entorno)
10. [🚀 Quick Start](#-quick-start)
11. [📡 API Endpoints](#-api-endpoints)
12. [💡 Ejemplos de Uso](#-ejemplos-de-uso)
13. [🧪 Testing](#-testing)
14. [📦 Deployment](#-deployment)
15. [🛠️ Troubleshooting](#️-troubleshooting)
16. [🤝 Contribución](#-contribución)
17. [📄 Licencia](#-licencia)

17. [📄 Licencia](#-licencia)

---

## 🎯 Características Principales

- ✨ **Generación de Flashcards con IA**: Integración con Google Gemini para respuestas inteligentes
- 🏗️ **Arquitectura Hexagonal**: Separación clara de capas (Controllers, Services, Infrastructure)
- 🔒 **Autenticación Robusta**: Integración con Clerk para JWT validation
- ⚡ **Módulos ESM Puros**: TypeScript con extensiones `.js` explícitas para Node.js nativo
- 🛡️ **Validación Completa**: Zod schemas en todos los endpoints
- 🚦 **Rate Limiting Inteligente**: Límites por usuario y plan (FREE/PRO)
- 💾 **Transacciones Optimizadas**: Operaciones MySQL con pre-carga y batching
- 📊 **Dashboard Analytics**: Métricas y estadísticas de flashcards por tema
- 🎨 **Gestión de Temas**: CRUD completo para organización de flashcards
- 🔄 **Streaming de Respuestas**: Reducción de latencia con agregación de chunks IA

---

## 🏗️ Arquitectura Hexagonal

### Principios de Diseño

El proyecto sigue una **Arquitectura Hexagonal (Ports & Adapters)** estricta:

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE ENTRADA                         │
│  Controllers (HTTP) + Middlewares (Validation, Auth)       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   CAPA DE NEGOCIO                           │
│  Services (QuestionService, UserService, ThemeService)      │
│  - Lógica pura, sin dependencias de frameworks             │
│  - Reciben dependencias por constructor (DI)                │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                CAPA DE INFRAESTRUCTURA                      │
│  - DB: MySQLRepository (pool, transactions)                 │
│  - IA: GeminiModel (streaming, prompt building)             │
│  - DI Containers: Resolución de dependencias                │
└─────────────────────────────────────────────────────────────┘
```

### Ventajas

- ✅ **Testeable**: Services aislados, fácil de mockear
- ✅ **Mantenible**: Cambio de DB o IA sin tocar lógica de negocio
- ✅ **Escalable**: Añadir nuevas features sin efectos colaterales

---

## 🔌 Inyección de Dependencias

### Sistema de Contenedores

Los servicios se resuelven mediante contenedores en `src/infrastructure/di/`:

#### 1. **container.ts** (Servicios dependientes de IA)

```typescript
export function resolveServices({ model }: serviceProps): QuestionService {
    const IA_MODEL = new GeminiModel(API_KEY, modelName)
    return new QuestionService(IA_MODEL)
}
```

**Modelos disponibles:**
- `Kōga (甲賀)` - Modelo estándar
- `Kurayami (暗闇)` - Modelo alternativo

#### 2. **userContainer.ts** (Instancias pre-configuradas)

```typescript
const userRepository = new MySQLRepository()
export const userService = new UserService(userRepository)
```

#### 3. **themeContainer.ts** & **dashboardContainer.ts**

Misma estrategia para temas y dashboard.

### Flujo de Inyección

```
Controller → Import Container → Get Resolved Service → Execute Logic
```

**Beneficio**: Los controllers nunca instancian directamente, siempre importan servicios ya configurados.

---

## 🤖 Integración con IA

### Arquitectura de Abstracción

```typescript
interface IAInterface {
    generateAnswer(tema: string, pregunta: string[]): Promise<string>
    generateMultipleAnswer(tema: string, preguntas: string[]): Promise<string[]>
}
```

### Implementación Actual: GeminiModel

**Características:**
- ✅ **Streaming progresivo**: Chunks agregados para mejor UX
- ✅ **Prompts dinámicos**: Templates con variables `{{tema}}` y `{{pregunta}}`
- ✅ **Manejo de errores**: Retry logic y logging detallado
- ✅ **Response parsing**: Regex para extraer respuestas numeradas

### Ejemplo de Prompt Building

```typescript
// src/ia/utils/questionsBuilder.ts
export function questionsPrompt(tema: string, pregunta: string): string {
    return env.AI_ANSWERS_PROMPT
        .replace(/{{tema}}/g, tema)
        .replace(/{{pregunta}}/g, pregunta);
}
```

### Configuración de Modelos

Variables de entorno:
- `GEMINI_KOGA`: Modelo principal
- `GEMINI_KURAYAMI`: Modelo alternativo
- `GEMINI_API_KEY`: API key de Google

---

## ✅ Validación de Datos

### Zod Schemas

Todos los endpoints tienen validación estricta con **Zod**:

#### Ejemplo: Validación de Preguntas

```typescript
// src/schemes/questionRequest.ts
export const questionsRequestSchema = z.object({
    questions: z.array(z.string().trim().min(5).max(2000)).min(1).max(5),
    tema: z.string().trim().min(3).max(12),
    model: z.string().trim().min(3).max(20),
})
```

#### Ejemplo: Validación de Temas

```typescript
// src/schemes/themeValidator.ts
export const themeValidatorSchema = z.object({
    theme_name: z.string().trim().min(5).max(12),
});
```

### Middleware de Validación

```typescript
// src/middlewares/validateBody.ts
export const validateBody = (schema: z.ZodType) => 
    (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            res.status(400).json({
                error: 'Datos inválidos',
                details: z.prettifyError(result.error),
            });
            return;
        }
        req.body = result.data; // ✅ Datos parseados y tipados
        next();
    }
```

### Uso en Rutas

```typescript
appRouter.post("/ask", validateBody(questionsRequestSchema), askQuestion)
```

**Respuesta de error ejemplo:**

```json
{
    "error": "Datos inválidos",
    "details": "questions: Required; tema: String must contain at least 3 character(s)"
}
```

---

## 🔐 Seguridad y Rate Limiting

### Helmet & Headers

```typescript
app.use(helmet()) // Security headers
app.disable('x-powered-by') // Oculta Express
```

### Autenticación con Clerk

Middleware `validateAuth` en todas las rutas protegidas:

```typescript
// src/middlewares/validateAuth.ts
export const validateAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const verifiedToken = await verifyToken(token, { jwtKey: env.CLERK_JWT_KEY })
    
    req.user = {
        id: tokenData.sub,
        userLevel: tokenData.pla.split(':')[1]
    }
    next()
}
```

### Rate Limiting por Plan

**Configuración actual:**

| Endpoint | FREE Plan | PRO Plan |
|----------|-----------|----------|
| `/api/questions` | 5 req/min | 10 req/min |
| `/api/user` | 20 req/min | 40 req/min |
| `/api/dashboard` | 20 req/min | 40 req/min |
| `/api/themes` | 10 req/min | 20 req/min |

**Implementación:**

```typescript
// src/services/rateLimiter.ts
export const limiter = ({ minuteDuration, maxRequest }) => {
    return rateLimit({
        windowMs: minuteDuration * 60 * 1000,
        max: (req: Request) => {
            if (req.user?.userLevel === USER_PLANS.PRO_USER) {
                return maxRequest * 2; // 2x para PRO
            }
            return maxRequest;
        },
        keyGenerator: (req) => `${req.user?.id}/LEVEL:${req.user?.userLevel}/PATH:${req.path}`,
        message: "Too many requests. Please try again later"
    })
}
```

### Planes de Usuario

```typescript
// src/entities/users/userPlans.ts
export const USER_PLANS = {
    FREE: "free_tier",
    PRO_USER: "pro_user",
} as const
```

---

## 🗄️ Base de Datos

### MySQLRepository - Patrón Transaccional

#### Ejemplo: saveFlashcard con Optimización

```typescript
async saveFlashcard(data: flashcardToSync): Promise<{success: boolean, message: string}> {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // ═══ FASE 1: PRE-CARGA (reduce N×6 queries a 3) ═══
        // 1. Obtener todos los theme_id únicos
        const uniqueThemes = [...new Set(flashcard.map(c => c.theme))];
        const [themesRows] = await connection.query(
            'SELECT theme_id, theme_name FROM themes WHERE theme_name IN (?)',
            [uniqueThemes]
        );
        
        // 2. Crear mapa theme_name → theme_id (O(1) lookup)
        const themeMap = new Map();
        for (const row of themesRows) {
            themeMap.set(row.theme_name, row.theme_id);
        }
        
        // 3. Validar existencia
        for (const themeName of uniqueThemes) {
            if (!themeMap.has(themeName)) {
                throw new Error(`El tema "${themeName}" no existe`);
            }
        }
        
        // ═══ FASE 2: INSERCIÓN BATCH ═══
        // INSERT IGNORE para idempotencia
        await connection.query(
            'INSERT IGNORE INTO user_themes (user_id, theme_id) VALUES ?',
            [themeValues]
        );
        
        await connection.commit();
        return { success: true, message: "Flashcards guardadas exitosamente" };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release(); // ✅ Siempre liberar conexión
    }
}
```

### Connection Pooling

```typescript
// src/infrastructure/db/mysql.ts
export const pool = mysql.createPool({
    host: env.DB_DATA.host,
    user: env.DB_DATA.user,
    password: env.DB_DATA.password,
    database: env.DB_DATA.name,
    waitForConnections: env.DB_DATA.waitForConnections,
    connectionLimit: env.DB_DATA.connectionLimit, // Default: 10
})
```

### Buenas Prácticas Implementadas

- ✅ **Transacciones**: BEGIN → COMMIT/ROLLBACK → RELEASE
- ✅ **INSERT IGNORE**: Previene duplicados en asociaciones
- ✅ **Validación previa**: Verificar existencia antes de insertar
- ✅ **Logging estructurado**: `queryLog()` para debugging
- ✅ **Connection release**: Siempre en `finally`

---

## 📁 Estructura del Proyecto

```
flashcards-api/
├── src/
│   ├── index.ts                      # Bootstrap de la aplicación
│   ├── api.http                      # Ejemplos de endpoints (REST Client)
│   │
│   ├── config/
│   │   └── env.ts                    # Configuración centralizada + validación
│   │
│   ├── controllers/                  # Capa HTTP
│   │   ├── QuestionController.ts
│   │   ├── createFlashcardController.ts
│   │   ├── getFlashcardsController.ts
│   │   ├── deleteFlashcardController.ts
│   │   ├── userDataController.ts
│   │   ├── dashboardData/            # Controllers de analytics
│   │   │   ├── getCountFlashcardsByTheme.ts
│   │   │   ├── getLastestFlashcardsCreated.ts
│   │   │   ├── getMaxFlashcardsByUser.ts
│   │   │   └── getThemeWithMaxFlashcards.ts
│   │   └── themeData/                # Controllers de temas
│   │       ├── createThemeController.ts
│   │       ├── deleteThemeController.ts
│   │       ├── getAllThemesController.ts
│   │       ├── getThemeStatusController.ts
│   │       └── updateThemeStatusController.ts
│   │
│   ├── services/                     # Lógica de negocio
│   │   ├── QuestionService.ts
│   │   ├── userService.ts
│   │   ├── themeService.ts
│   │   ├── dashBoardService.ts
│   │   └── rateLimiter.ts
│   │
│   ├── infrastructure/               # Capa de infraestructura
│   │   ├── di/                       # Dependency Injection
│   │   │   ├── container.ts          # Servicios IA
│   │   │   ├── userContainer.ts
│   │   │   ├── themeContainer.ts
│   │   │   └── dashboardContainer.ts
│   │   └── db/                       # Repositorios
│   │       ├── mysql.ts              # Connection pool
│   │       ├── MySQLRepository.ts    # Implementación completa
│   │       └── userRepository.ts
│   │
│   ├── ia/                           # Adaptadores IA
│   │   ├── IAInterface.ts            # Abstracción
│   │   ├── GeminiModel.ts            # Implementación Gemini
│   │   └── utils/
│   │       ├── questionsBuilder.ts
│   │       └── manyQuestionsBuilder.ts
│   │
│   ├── middlewares/                  # Middlewares
│   │   ├── validateAuth.ts           # Clerk JWT validation
│   │   ├── validateBody.ts           # Zod body validation
│   │   └── validateIDInput.ts        # Zod params validation
│   │
│   ├── routes/                       # Definición de rutas
│   │   ├── app.ts                    # /api/questions
│   │   ├── userRouter.ts             # /api/user
│   │   ├── themeRouter.ts            # /api/themes
│   │   ├── dashboardRouter.ts        # /api/dashboard
│   │   ├── createUser.ts             # /api/user/create
│   │   └── deleteUser.ts             # /api/user/delete
│   │
│   ├── schemes/                      # Zod validation schemas
│   │   ├── questionRequest.ts
│   │   ├── themeValidator.ts
│   │   └── idValidator.ts
│   │
│   ├── entities/                     # Modelos de dominio
│   │   ├── users/
│   │   │   ├── userModel.ts
│   │   │   └── userPlans.ts
│   │   ├── flashcard/
│   │   │   └── flashCardModel.ts
│   │   ├── dashboard/
│   │   │   └── dashboardData.ts
│   │   └── models/
│   │       └── models.ts
│   │
│   ├── models/interfaces/            # Interfaces de repositorios
│   │   ├── UserRepository.ts
│   │   ├── ThemeRepository.ts
│   │   ├── DashboardRepository.ts
│   │   ├── flashcardData.ts
│   │   └── auth.ts
│   │
│   ├── utils/                        # Utilidades
│   │   └── logger.ts
│   │
│   └── __tests__/                    # Tests
│       ├── setup.ts
│       ├── simple.test.ts
│       └── infrastructure/
│           └── db/
│               ├── MySQLRepository.basic.test.ts
│               └── MySQLRepository.production.test.ts
│
├── .env.example                      # Template de variables de entorno
├── tsconfig.json                     # TypeScript config (ESNext + bundler)
├── package.json                      # Dependencies + scripts
├── eslint.config.js                  # Linting rules
├── jest.config.js                    # Testing config
├── DEPLOYMENT.md                     # Guía de despliegue completa
├── PRODUCTION_READY_REPORT.md        # Report de producción
└── README.md                         # Este archivo
```

### Convenciones de Código

- **Naming**:
  - `camelCase`: funciones, variables
  - `PascalCase`: clases, interfaces, types
  - `UPPER_SNAKE_CASE`: constantes globales
- **Imports**: Siempre con extensión `.js` (ESM requirement)
- **Exports**: Named exports preferidos sobre default
- **Error Handling**: Patrón `try-catch` con tipos `unknown`

---

## ⚙️ Variables de Entorno

### Archivo `.env` Requerido

```bash
# ========================================
# FLASHCARDS API - Environment Variables
# ========================================

# Server Configuration
NODE_ENV=production
PORT=4444

# Google Gemini AI Keys
GEMINI_KOGA=your_gemini_api_key_here
GEMINI_KURAYAMI=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# API Authentication
API_KEY=your_api_key_here

# Clerk Authentication
CLERK_JWT_KEY=your_clerk_jwt_key_here

# AI Prompts (Optional - defaults used if not set)
AI_ANSWERS_PROMPT="Genera una respuesta concisa sobre {{tema}}: {{pregunta}}"
AI_MANY_ANSWERS_PROMPT="Responde las siguientes preguntas sobre {{tema}}:\n{{readyQuestions}}"

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password_here
DB_NAME=flashcards_db
DB_WAIT_FOR_CONNECTION=true
DB_CONNECTION_LIMIT=10
```

### Validación Temprana

El sistema valida variables críticas al inicio:

```typescript
// src/config/env.ts
if (!process.env.GEMINI_KOGA || !process.env.GEMINI_KURAYAMI) {
    throw new Error('Missing required environment variables: GEMINI_KOGA or GEMINI_KURAYAMI')
}

if (!process.env.API_KEY) {
    throw new Error('Missing required environment variable: API_KEY')
}

if (!process.env.CLERK_JWT_KEY) {
    throw new Error('Missing required environment variable: CLERK_JWT_KEY')
}
```

---

## 🚀 Quick Start

### Prerequisitos

- **Node.js**: 22.x o superior
- **pnpm**: 10.19.0
- **MySQL**: 8.0 o superior
- **Clerk Account**: Para JWT authentication
- **Google Cloud Account**: Para Gemini API

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/EleanQuintero/flashcards-api.git
cd flashcards-api

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Configurar base de datos
# Ejecutar migraciones SQL (revisar schema en docs/)

# 5. Build (si quieres probar producción local)
pnpm build

# 6. Desarrollo
pnpm dev
```

### Scripts Disponibles

```bash
pnpm dev              # Desarrollo con hot-reload (nodemon + ts-node/esm)
pnpm build            # Compilar TypeScript a dist/
pnpm start            # Ejecutar versión compilada (producción)
pnpm lint             # Ejecutar ESLint
pnpm test             # Ejecutar tests con Jest
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con cobertura
pnpm test:ci          # Tests para CI/CD
```

### Verificación de Instalación

```bash
# Compilar el proyecto
pnpm build

# Iniciar servidor
pnpm dev

# En otra terminal, probar health check
curl http://localhost:4444/api/health
```

---

## 📡 API Endpoints

### Base URL

```
http://localhost:4444/api
```

### Autenticación

Todas las rutas (excepto `/api/user/create`) requieren JWT token de Clerk:

```
Authorization: Bearer <CLERK_JWT_TOKEN>
```

---

### 🤖 Questions (Generación de Respuestas IA)

#### `POST /api/questions/ask`

Genera respuestas con IA (single o múltiples preguntas).

**Request:**

```json
{
    "tema": "anime",
    "questions": [
        "¿Cuál es el opening de Sword Art Online?",
        "¿Cuál es el opening de Evangelion?"
    ],
    "model": "Kōga (甲賀)"
}
```

**Response:**

```json
{
    "answer": [
        "El opening principal de Sword Art Online es 'Crossing Field' de LiSA.",
        "El opening más icónico de Evangelion es 'A Cruel Angel's Thesis' de Yoko Takahashi."
    ]
}
```

**Rate Limit:** 5 req/min (FREE), 10 req/min (PRO)

---

### 👤 Users

#### `POST /api/user/create/new`

Crear nuevo usuario (NO requiere auth).

**Request:**

```json
{
    "id": "user_abc123",
    "name": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
}
```

**Response:**

```json
{
    "message": "Usuario registrado exitosamente"
}
```

#### `DELETE /api/user/delete/:user_id`

Eliminar usuario y todos sus datos asociados.

**Response:**

```json
{
    "message": "Usuario eliminado exitosamente"
}
```

---

### 🎴 Flashcards

#### `POST /api/user/flashcard/new`

Crear nuevas flashcards.

**Request:**

```json
{
    "user_id": "user_abc123",
    "flashcard": [
        {
            "theme": "Anime",
            "question": "¿Quién es el protagonista de SAO?",
            "answer": "Kirito"
        },
        {
            "theme": "Anime",
            "question": "¿Qué es un Stand en JoJo?",
            "answer": "Manifestación del espíritu de batalla"
        }
    ]
}
```

**Response:**

```json
{
    "success": true,
    "message": "Flashcards guardadas exitosamente"
}
```

#### `GET /api/user/flashcard/getByID/:userId`

Obtener todas las flashcards de un usuario.

**Response:**

```json
[
    {
        "flashcard_id": "2d3df0b1",
        "question": "¿Quién es el protagonista de SAO?",
        "answer": "Kirito",
        "theme": "Anime"
    }
]
```

#### `DELETE /api/user/flashcard/delete/:userId/:id`

Eliminar una flashcard específica.

**Response:**

```json
"Flashcard eliminada exitosamente"
```

---

### 🎨 Themes (Gestión de Temas)

#### `GET /api/themes/get`

Obtener todos los temas del usuario autenticado.

**Response:**

```json
{
    "success": true,
    "message": "Temas obtenidos exitosamente",
    "data": [
        {
            "theme_id": 1,
            "theme_name": "Anime",
            "created_at": "2025-01-15T10:30:00Z"
        },
        {
            "theme_id": 2,
            "theme_name": "Historia",
            "created_at": "2025-01-16T14:20:00Z"
        }
    ]
}
```

#### `POST /api/themes/add`

Crear nuevo tema.

**Request:**

```json
{
    "theme_name": "Filosofía"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Tema creado exitosamente"
}
```

**Validación:**
- `theme_name`: 5-12 caracteres

#### `DELETE /api/themes/delete/:themeId`

Eliminar tema.

**Response:**

```json
{
    "success": true,
    "message": "Tema eliminado exitosamente"
}
```

#### `GET /api/themes/theme-status`

Obtener estado del tema activo.

**Response:**

```json
{
    "success": true,
    "message": "Estado obtenido",
    "theme_status": "Anime"
}
```

#### `POST /api/themes/update-theme-status`

Actualizar tema activo.

**Response:**

```json
{
    "success": true,
    "message": "Estado actualizado"
}
```

**Rate Limit:** 10 req/min (FREE), 20 req/min (PRO)

---

### 📊 Dashboard (Analytics)

#### `GET /api/dashboard/countByTheme/:userId`

Contar flashcards por tema.

**Response:**

```json
{
    "success": true,
    "message": "Datos obtenidos exitosamente",
    "data": [
        { "theme": "Anime", "count": 45 },
        { "theme": "Historia", "count": 23 },
        { "theme": "Ciencia", "count": 12 }
    ]
}
```

#### `GET /api/dashboard/latestFlashcards/:userId`

Obtener últimas flashcards creadas.

**Response:**

```json
{
    "success": true,
    "message": "Flashcards recientes obtenidas",
    "data": [
        {
            "question": "¿Qué es la fotosíntesis?",
            "theme": "Biología",
            "createdAt": "2025-01-20T15:30:00Z"
        }
    ]
}
```

#### `GET /api/dashboard/maxFlashcards/:userId`

Obtener número máximo de flashcards del usuario.

**Response:**

```json
{
    "success": true,
    "message": "Total de flashcards obtenido",
    "count": 120
}
```

#### `GET /api/dashboard/themeWithMaxFlashcards/:userId`

Obtener tema con más flashcards.

**Response:**

```json
{
    "success": true,
    "message": "Tema con más flashcards",
    "data": {
        "theme": "Anime",
        "count": 45
    }
}
```

**Rate Limit:** 20 req/min (FREE), 40 req/min (PRO)

---

## 💡 Ejemplos de Uso

### Usando cURL

```bash
# Crear usuario
curl -X POST http://localhost:4444/api/user/create/new \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_123",
    "name": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "user"
  }'

# Generar respuesta con IA (requiere auth)
curl -X POST http://localhost:4444/api/questions/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CLERK_TOKEN>" \
  -d '{
    "tema": "historia",
    "questions": ["¿Quién descubrió América?"],
    "model": "Kōga (甲賀)"
  }'

# Obtener flashcards
curl -X GET http://localhost:4444/api/user/flashcard/getByID/user_123 \
  -H "Authorization: Bearer <CLERK_TOKEN>"
```

### Usando REST Client (VS Code)

Ver archivo `src/api.http` para ejemplos completos:

```http
### Generar respuestas IA
POST http://localhost:4444/api/questions/ask
Content-Type: application/json
Authorization: Bearer {{clerkToken}}

{
    "tema": "anime",
    "questions": ["¿Cuál es el opening de SAO?"],
    "model": "Kōga (甲賀)"
}

### Crear flashcard
POST http://localhost:4444/api/user/flashcard/new
Content-Type: application/json
Authorization: Bearer {{clerkToken}}

{
    "user_id": "user_123",
    "flashcard": [
        {
            "theme": "Anime",
            "question": "¿Quién es Kirito?",
            "answer": "Protagonista de Sword Art Online"
        }
    ]
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Watch mode
pnpm test:watch

# Con cobertura
pnpm test:coverage

# CI/CD
pnpm test:ci
```

### Estructura de Tests

```
src/__tests__/
├── setup.ts                              # Configuración global
├── simple.test.ts                        # Tests básicos
├── infrastructure/
│   └── db/
│       ├── MySQLRepository.basic.test.ts
│       └── MySQLRepository.production.test.ts
└── utils/
    └── testHelpers.ts
```

### Ejemplo de Test

```typescript
describe('MySQLRepository', () => {
    it('should save flashcard correctly', async () => {
        const mockData = {
            user_id: 'test_user',
            flashcard: [{
                theme: 'Test',
                question: 'Q1',
                answer: 'A1'
            }]
        };
        
        const result = await repository.saveFlashcard(mockData);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Flashcards guardadas exitosamente');
    });
});
```

---

## 📦 Deployment

Ver **[DEPLOYMENT.md](./DEPLOYMENT.md)** para guía completa de despliegue.

### Opciones de Deployment

1. **Docker** (Recomendado)
2. **Cloud Platforms**:
   - AWS (EC2, ECS, Elastic Beanstalk)
   - Google Cloud (Cloud Run, GKE)
   - DigitalOcean App Platform
   - Railway / Render
3. **VPS Manual** (Ubuntu + PM2 + Nginx)

### Quick Deploy con Docker

```bash
# Build
docker build -t flashcards-api:latest .

# Run
docker run -d \
  --name flashcards-api \
  -p 4444:4444 \
  --env-file .env \
  flashcards-api:latest
```

### Pre-Deployment Checklist

- ✅ Variables de entorno configuradas
- ✅ Base de datos MySQL disponible
- ✅ Clerk JWT Key configurada
- ✅ Gemini API Key válida
- ✅ Tests pasando
- ✅ Build sin errores
- ✅ Rate limits ajustados
- ✅ HTTPS configurado (producción)

---

## 🛠️ Troubleshooting

### Error: Cannot find module with ESM

**Problema:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/dist/config/env'
```

**Solución:**

Asegúrate de que todos los imports relativos incluyan extensión `.js`:

```typescript
// ❌ Incorrecto
import { env } from './config/env'

// ✅ Correcto
import { env } from './config/env.js'
```

### Error: Database connection refused

**Problema:**

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solución:**

1. Verificar que MySQL está corriendo:
   ```bash
   mysql -u root -p
   ```

2. Verificar variables en `.env`:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   ```

3. Si usas Docker, cambiar `DB_HOST=localhost` por `DB_HOST=host.docker.internal`

### Error: Rate limit exceeded

**Problema:**

```json
{ "error": "Too many requests. Please try again later" }
```

**Solución:**

1. Esperar el tiempo de ventana (1 minuto)
2. Actualizar a plan PRO para 2x límites
3. Ajustar límites en `src/index.ts` si es desarrollo

### Error: Clerk JWT validation failed

**Problema:**

```json
{ "message": "Token de autorización inválido o expirado" }
```

**Solución:**

1. Verificar `CLERK_JWT_KEY` en `.env`
2. Obtener nuevo token desde Clerk Dashboard
3. Verificar formato del header:
   ```
   Authorization: Bearer <token>
   ```

### Error: Gemini API quota exceeded

**Problema:**

```
Error: Gemini API quota exceeded
```

**Solución:**

1. Verificar cuota en Google Cloud Console
2. Activar billing si es necesario
3. Usar modelo alternativo (`Kurayami`) temporalmente
4. Implementar caché de respuestas (futuro)

---

## 🤝 Contribución

### Guía de Contribución

1. **Fork** del repositorio
2. Crear rama feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Commit siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: añade endpoint de búsqueda de flashcards"
   ```
4. Push a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abrir **Pull Request**

### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de performance

### Código de Conducta

- Respetar las convenciones de código existentes
- Escribir tests para nuevas features
- Actualizar documentación cuando sea necesario
- Mantener commits pequeños y enfocados

---

## 📄 Licencia

Este proyecto está licenciado bajo la **ISC License**.

```
Copyright (c) 2025 Eleqful

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 👨‍💻 Autor

**Eleqful (Elean Quintero)**

- GitHub: [@EleanQuintero](https://github.com/EleanQuintero)
- Project: [flashcards-api](https://github.com/EleanQuintero/flashcards-api)

---

## 🙏 Agradecimientos

- **Google Gemini**: Por la API de IA generativa
- **Clerk**: Por el sistema de autenticación robusto
- **TypeScript Community**: Por las mejores prácticas de ESM
- **Open Source Contributors**: Por las librerías utilizadas

---

## 📚 Recursos Adicionales

- [Guía de Deployment](./DEPLOYMENT.md)
- [Production Ready Report](./PRODUCTION_READY_REPORT.md)
- [Testing Roadmap](./TESTING_ROADMAP.md)
- [Copilot Instructions](./.github/copilot-instructions.md)
- [API Examples](./src/api.http)

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐**

Made with ❤️ by Eleqful

</div>