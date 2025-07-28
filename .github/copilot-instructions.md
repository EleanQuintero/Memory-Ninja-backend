# Flashcards API - AI Coding Instructions

## Architecture Overview

This is a **Hexagonal Architecture** TypeScript Express API for flashcard generation using Google's Gemini AI. The system separates concerns through clear boundaries: Controllers handle HTTP, Services contain business logic, and Infrastructure manages external dependencies.

## Key Architectural Patterns

### Dependency Injection Containers

- Services are resolved via DI containers in `src/infrastructure/di/`
- `container.ts` resolves AI-dependent services: `resolveServices(userLevel: string)`
- `userContainer.ts` exports pre-configured instances: `export const userService = new UserService(userRepository)`
- Controllers import resolved services, never instantiate directly

### Request Validation Pipeline

All endpoints use Zod schemas with middleware validation:

```typescript
// Route definition pattern
appRouter.post("/ask", validateBody(questionsRequestSchema), askQuestion)

// Middleware automatically parses and validates
export const validateBody = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction)
```

### AI Integration Strategy

- `IAInterface` abstracts AI providers - currently only `GeminiModel`
- Services receive AI instances via constructor injection
- Two response patterns: single question (`generateAnswer`) vs batch (`generateMultipleAnswer`)
- Streaming responses with chunk aggregation for better UX

## Database Patterns

### Transaction-Heavy Operations

The `MySQLRepository.saveFlashcard()` method demonstrates the transaction pattern:

- Always use `connection.beginTransaction()` / `commit()` / `rollback()`
- INSERT IGNORE for idempotent associations (user_themes)
- Check existence before creating to avoid duplicates
- Complex multi-table inserts in single transactions

### Connection Management

- Use `pool.getConnection()` for transactions
- Always `connection.release()` in finally blocks
- Simple queries use `pool.query()` directly

## Development Workflow

### Essential Commands

```bash
pnpm dev          # Development with hot-reload using nodemon + ts-node/esm
pnpm build        # TypeScript compilation to dist/
pnpm start        # Production mode (requires build first)
pnpm lint         # ESLint with TypeScript parser
```

### Module System

Project uses **ESModules** (`"type": "module"` in package.json):

- Import statements only, no require()
- ts-node configured with `esm: true`
- File extensions matter in imports from external modules

## API Conventions

### Rate Limiting Pattern

Every route group has custom rate limits via `limiter()` function:

```typescript
app.use(
  "/api/questions",
  limiter({ minuteDuration: 1, maxRequest: 5 }),
  appRouter
);
app.use(
  "/api/user",
  limiter({ minuteDuration: 1, maxRequest: 10 }),
  userRouter
);
```

### Error Handling Standard

Controllers follow this error response pattern:

```typescript
} catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({error: error.message})
    } else {
        res.status(500).json({error: 'Ha ocurrido un error desconocido'})
    }
}
```

### Request/Response Types

- Custom interfaces extend Express types: `QuestionRequest extends Request`
- Response data wrapped in success/message objects: `{success: boolean, message: string, data?: T}`
- All validation schemas in `src/schemes/` using Zod

## Critical Files to Understand

- `src/index.ts` - App bootstrap, middleware setup, route mounting
- `src/infrastructure/di/` - Service resolution and dependency graphs
- `src/infrastructure/db/MySQLRepository.ts` - Database transaction patterns
- `src/schemes/` - Zod validation schemas define API contracts
- `src/api.http` - Live API examples for all endpoints

## Security & Performance

- Helmet middleware for security headers
- `app.disable('x-powered-by')` to hide Express
- MySQL connection pooling with configurable limits
- AI responses limited to 256 characters for performance
- Streaming AI responses to reduce perceived latency

When working on this codebase, always consider the dependency injection flow, validate inputs with Zod, handle database transactions properly, and maintain the established error handling patterns.
