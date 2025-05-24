# Flashcards API

## Descripción
Backend de Flashcards Generator desarrollado por Eleqful. Esta API proporciona servicios para la generación y gestión de tarjetas de estudio (flashcards) utilizando inteligencia artificial.

## Arquitectura
El proyecto sigue una arquitectura Hexagonal, utilizando inyeccion de dependencias, con una clara separación de responsabilidades:

- **Controllers**: Manejan las peticiones HTTP y la validación inicial de datos
- **Services**: Contienen la lógica de negocio principal
- **Models**: Definen las estructuras de datos y esquemas
- **Routes**: Definen los endpoints de la API
- **Middlewares**: Procesan las peticiones antes de llegar a los controllers
- **Infrastructure**: Contiene configuraciones y servicios de infraestructura
- **IA**: Módulos relacionados con la integración de inteligencia artificial
- **Schemes**: Definiciones de validación de datos usando Zod
- **Consts**: Constantes y configuraciones globales

## Tecnologías Principales
- Node.js
- TypeScript
- Express.js
- Google Generative AI (@google/genai)
- Zod (validación de esquemas)
- ESLint (linting)
- PNPM (gestor de paquetes)

## Requisitos Previos
- Node.js (versión recomendada: la más reciente LTS)
- PNPM 10.11.0 o superior

## Instalación
1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias
```bash
pnpm install
```

## Scripts Disponibles
- `pnpm dev`: Inicia el servidor en modo desarrollo con hot-reload
- `pnpm build`: Compila el proyecto TypeScript
- `pnpm start`: Inicia el servidor en modo producción
- `pnpm lint`: Ejecuta el linter para verificar el código

## Estructura del Proyecto
```
src/
├── controllers/    # Controladores de la API
├── services/       # Lógica de negocio
├── models/         # Modelos de datos
├── routes/         # Definición de rutas
├── middlewares/    # Middlewares de Express
├── infrastructure/ # Configuraciones de infraestructura
├── ia/            # Integración con IA
├── schemes/       # Esquemas de validación
├── consts/        # Constantes y configuraciones
└── index.ts       # Punto de entrada de la aplicación
```

## Características Principales
- Generación de flashcards usando IA
- Validación de datos con Zod
- Arquitectura modular y escalable
- Soporte para TypeScript
- Configuración de ESLint para mantener la calidad del código

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia ISC.

## Autor
Eleqful 