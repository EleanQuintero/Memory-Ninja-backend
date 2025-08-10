# Flashcards API

Backend para la generación y gestión de flashcards usando IA (Google Gemini) bajo Arquitectura Hexagonal con TypeScript y Express.

## Tabla de Contenidos
1. Descripción
2. Arquitectura (Hexagonal)
3. Flujo de Dependencias / Inyección (DI)
4. Integración con IA
5. Validación (Zod)
6. Manejo de Errores
7. Rate Limiting & Seguridad
8. Base de Datos y Transacciones
9. Estructura del Proyecto
10. Convenciones de Código
11. Variables de Entorno
12. Scripts de Desarrollo
13. Ejecución Rápida (Quick Start)
14. Ejemplos de Endpoints
15. Respuestas y Formato
16. Estrategia de Streaming
17. To‑Dos / Próximos Pasos
18. Contribución
19. Licencia
20. Autor

## 1. Descripción
Servicio que:
- Genera flashcards a partir de preguntas o lotes de preguntas.
- Persiste datos asociados (usuarios, temas, tarjetas).
- Optimiza latencia usando streaming parcial de respuestas IA.

## 2. Arquitectura (Hexagonal)
Capas:
- Controllers: HTTP + serialización/deserialización mínima.
- Services: Lógica de negocio pura, reciben dependencias por constructor.
- Infrastructure: DB, IA, DI containers, rate limiter, middlewares técnicos.
- Schemes (Zod): Contratos de entrada.
- Models / Entities: Representaciones de dominio / datos.
- Routes: Montaje de endpoints + middleware de validación.

Principio: Los servicios no conocen Express ni detalles concretos de infraestructura.

## 3. Flujo de Dependencias / Inyección (DI)
- Contenedores en `src/infrastructure/di/`.
- `container.ts` expone `resolveServices(userLevel: string)` para construir servicios dependientes de IA.
- `userContainer.ts` crea instancias preconfiguradas (ej: `userService` con su repository).
- Controllers importan servicios ya resueltos, nunca instancian directamente repositorios o IA.

Beneficio: Facilita pruebas y reemplazo del proveedor de IA o DB sin tocar lógica de negocio.

## 4. Integración con IA
- Interfaz `IAInterface` abstrae el proveedor (actual: Gemini).
- Implementación actual: `GeminiModel`.
- Métodos diferenciados:
  - `generateAnswer` (single question).
  - `generateMultipleAnswer` (batch).
- Límite de respuesta: 256 caracteres (optimización de coste/latencia).
- Streaming: Se agrupan chunks para respuesta progresiva.

## 5. Validación (Zod)
- Schemas en `src/schemes/`.
- Middleware `validateBody(schema)` se aplica en las rutas:
  ```ts
  appRouter.post("/ask", validateBody(questionsRequestSchema), askQuestion)
  ```
- Si falla validación: respuesta 400 con detalle de errores.

## 6. Manejo de Errores
Patrón uniforme en controllers:
```ts
} catch (error: unknown) {
  if (error instanceof Error) {
    res.status(500).json({ error: error.message })
  } else {
    res.status(500).json({ error: "Ha ocurrido un error desconocido" })
  }
}
```
Se recomienda:
- No filtrar stack en producción (configurable).
- Mantener mensajes de negocio claros y genéricos para errores internos.

## 7. Rate Limiting & Seguridad
- Rate limitador por grupo de rutas:
  - `/api/questions` → p.ej. 5 req/min.
  - `/api/user` → p.ej. 10 req/min.
- Middleware Helmet para cabeceras seguras.
- `app.disable("x-powered-by")` para ocultar tecnología.
- Recomendar futura integración: CORS restrictivo, audit logging.

## 8. Base de Datos y Transacciones
Repositorio principal: `MySQLRepository`.
Patrón transaccional (`saveFlashcard()`):
- `connection.beginTransaction()`.
- `INSERT IGNORE` para asociaciones idempotentes (`user_themes`).
- Verificación existencia previa de entidades para evitar duplicados.
- `commit()` / `rollback()` y `release()` en `finally`.
Consultas simples usan `pool.query()`.
Buenas prácticas:
- No mezclar lógica de negocio con SQL (repositorio encapsula).
- Reintentar en errores de deadlock (pendiente si no está implementado).

## 9. Estructura del Proyecto
```
src/
  api.http                # Ejemplos manuales de consumo
  index.ts                # Bootstrap de la app
  controllers/            # Controladores HTTP
  services/               # Lógica de negocio
  infrastructure/
    di/                   # Contenedores de inyección
    db/                   # Repositorios MySQL / conexión
    ai/ (o ia/)           # Adaptadores IA (Gemini)
  schemes/                # Zod schemas
  middlewares/            # Validación, rate limit, etc.
  consts/                 # Constantes
  models/                 # Entidades / tipos
```
Tipo de módulo: ESModules (`"type": "module"`). Usar imports con extensión cuando requiera.

## 10. Convenciones de Código
- TypeScript estricto (recomendado).
- ESLint para estilo y calidad.
- Nombrado: camelCase en funciones, PascalCase para Types/Interfaces.
- Evitar lógica en controllers > 30 líneas (delegar a servicios).
- No usar `require()`.
- Respuestas API siempre envueltas en objeto (ver sección 15).

## 11. Variables de Entorno
Crear `.env` (no versionar):
```
NODE_ENV=development
PORT=3000

# IA
GOOGLE_API_KEY=TU_API_KEY

# DB
DB_HOST=localhost
DB_PORT=3306
DB_NAME=flashcards
DB_USER=root
DB_PASSWORD=secret

# Rate limiting (ejemplo, si se parametriza)
RATE_LIMIT_WINDOW_MIN=1
RATE_LIMIT_QUESTIONS_MAX=5
RATE_LIMIT_USER_MAX=10
```
(Confirma nombres reales si difieren).

## 12. Scripts de Desarrollo
```
pnpm dev     # nodemon + ts-node ESM
pnpm build   # Compila a dist/
pnpm start   # Ejecuta versión compilada
pnpm lint    # Linter
```

## 13. Ejecución Rápida (Quick Start)
```bash
pnpm install
cp .env.example .env   # (si existe; crear manual si no)
pnpm dev
# Abrir http://localhost:3000
```

## 14. Ejemplos de Endpoints
(Adaptar rutas exactas si difieren)
- POST /api/questions/ask
  Body:
  ```json
  { "question": "¿Qué es la fotosíntesis?", "userLevel": "beginner" }
  ```
- POST /api/questions/ask-batch
  Body:
  ```json
  { "questions": ["Q1", "Q2"], "userLevel": "advanced" }
  ```
- GET /api/user/:id
- POST /api/user (creación)

Usar `api.http` para ejemplos completos.

## 15. Respuestas y Formato
Estructura estándar:
```json
{
  "success": true,
  "message": "Flashcards generadas",
  "data": { "cards": [ ... ] }
}
```
Errores:
```json
{ "success": false, "error": "Detalle del error" }
```

## 16. Estrategia de Streaming
- IA envía chunks.
- Se agregan y devuelven progresivamente (mejor experiencia).
- Límite de longitud para evitar respuestas excesivas (256 chars configurado en servicio IA).

## 17. To‑Dos / Próximos Pasos
- Añadir pruebas unitarias/integración (Jest o Vitest) para servicios y repos.
- Documentar OpenAPI/Swagger.
- Métricas (Prometheus) y logging estructurado (p.ej. pino).
- Cache de prompts/respuestas (Redis) para evitar coste repetido.
- Implementar políticas de reintento para errores transitorios de DB/IA.
- Añadir autenticación/autorización (JWT / API Keys) si se expone públicamente.

## 18. Contribución
1. Fork
2. Rama feature: `git checkout -b feature/nombre`
3. Commit descriptivo: `git commit -m "feat: agrega X"`
4. Push: `git push origin feature/nombre`
5. Pull Request

Convención de commits sugerida: Conventional Commits (feat, fix, chore, refactor, docs, test).

## 19. Licencia
ISC.

## 20. Autor
Eleqful

---