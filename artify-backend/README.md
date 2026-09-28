# Artify Backend — Node.js + Express

The backend has been converted to Node.js + Express.

## Stack
- Node.js
- Express
- Sequelize ORM
- MySQL
- JWT authentication
- bcryptjs password hashing
- CORS

## No Docker
This backend does **not** use Docker, Docker Compose, a Dockerfile, or `.dockerignore`.

## Requirements
- Node.js 18+
- MySQL 8+
- Existing `artify_db` database/schema

## Setup

```bash
cd artify-backend
npm install
copy .env.example .env
```

On Linux/macOS use:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials.

The converted backend expects the existing MySQL tables created by the original Spring/JPA project. It intentionally does not run `sequelize.sync({ alter: true })`, so it will not silently change your existing database schema.

Start:

```bash
npm run dev
```

or:

```bash
npm start
```

Backend: `http://localhost:8081`

Health check: `GET http://localhost:8081/api/health`

## Frontend

The React frontend continues to use `/api` endpoints. Set its API base URL to:

`http://localhost:8081/api`

If your frontend currently reads `REACT_APP_API_URL`, keep that value as:

```env
REACT_APP_API_URL=http://localhost:8081/api
```

## Main API groups

- `/api/auth`
- `/api/products`
- `/api/categories`
- `/api/artists`
- `/api/reviews`
- `/api/cart`
- `/api/orders`
- `/api/payments`
- `/api/admin`

JWT remains a Bearer token, and CUSTOMER / ARTIST / ADMIN authorization is preserved.
