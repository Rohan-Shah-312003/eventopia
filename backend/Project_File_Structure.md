event-management-backend/
│── src/
│ │── app.js # Express app setup (middlewares, routes, error handling)
│ │── server.js # Entry point (start server)
│ │── config/ # Configuration files
│ │ │── db.js # Database connection (Prisma/Sequelize)
│ │ │── env.js # Environment variables (dotenv)
│ │ └── logger.js # Logger config (winston/pino)
│ │
│ │── models/ # Database Models (if Sequelize/Prisma auto-generated, keep DTOs here)
│ │ │── user.model.js
│ │ │── club.model.js
│ │ │── event.model.js
│ │ │── eventRegistration.model.js
│ │ └── auditLog.model.js
│ │
│ │── routes/ # API route definitions
│ │ │── auth.routes.js
│ │ │── user.routes.js
│ │ │── club.routes.js
│ │ │── event.routes.js
│ │ │── registration.routes.js
│ │ └── dashboard.routes.js
│ │
│ │── controllers/ # Route handlers (business logic entry)
│ │ │── auth.controller.js
│ │ │── user.controller.js
│ │ │── club.controller.js
│ │ │── event.controller.js
│ │ │── registration.controller.js
│ │ └── dashboard.controller.js
│ │
│ │── services/ # Core business logic (separate from controllers)
│ │ │── auth.service.js
│ │ │── user.service.js
│ │ │── club.service.js
│ │ │── event.service.js
│ │ │── registration.service.js
│ │ └── dashboard.service.js
│ │
│ │── middlewares/ # Express middlewares
│ │ │── auth.middleware.js # JWT verification, role-based access
│ │ │── error.middleware.js # Centralized error handling
│ │ └── validate.middleware.js # Request validation (Joi/Zod)
│ │
│ │── utils/ # Utility helpers
│ │ │── response.js # Standard API response formatter
│ │ │── constants.js # Roles, statuses, enums
│ │ └── email.js # Email/notification handler (if required)
│ │
│ │── validations/ # Request body schemas (Joi/Zod)
│ │ │── auth.validation.js
│ │ │── user.validation.js
│ │ │── club.validation.js
│ │ │── event.validation.js
│ │ └── registration.validation.js
│ │
│ │── docs/ # API documentation
│ │ └── openapi.yaml # Swagger/OpenAPI spec
│ │
│ └── seed/ # DB seeding (initial admin user, roles, etc.)
│ └── seed.js
│
│── prisma/ # Prisma schema (if using Prisma ORM)
│ └── schema.prisma
│
│── .env # Environment variables
│── package.json
│── README.md
