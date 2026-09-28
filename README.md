# ARTIFY --- Art Marketplace

## Live Application

**Frontend:** https://artify-lilac-beta.vercel.app/

**Backend API:** https://artify-9g2s.onrender.com/

**GitHub:** https://github.com/Neerajvarma713/Artify

------------------------------------------------------------------------

## About the Project

Artify is a full-stack online art marketplace that connects artists and
customers through a modern web application.

Customers can register, log in, browse artworks, view artwork details,
add products to a shopping cart, and place orders. Artists can maintain
artist information and showcase artwork, while administrators have
role-specific functionality.

The project was migrated from a Java/Spring Boot backend to a
**Node.js + Express.js** backend. Docker was removed from the final
architecture.

### Current architecture

``` text
React + Vite Frontend
        |
        | REST API
        v
Node.js + Express Backend
        |
        | Sequelize ORM
        v
PostgreSQL Database
```

------------------------------------------------------------------------

## Main Features

### Customer

-   Registration and login
-   JWT authentication
-   Profile management
-   Browse artwork
-   Artwork details
-   Category browsing
-   Add to cart
-   Change cart quantities
-   Remove cart items
-   Checkout/order flow
-   Orders
-   Reviews and ratings

### Artist

-   Artist registration
-   Artist profile
-   Portfolio information
-   Artwork/product management
-   Stock and product status
-   Artist rating and verification fields

### Admin

-   Admin authentication
-   User and role management support
-   Catalog management support
-   Order management support
-   Administrative API routes
-   Audit functionality

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   React
-   Vite
-   JavaScript / JSX
-   React Router
-   Tailwind CSS
-   Lucide React
-   REST API integration

**Deployment:** Vercel

### Backend

-   Node.js
-   Express.js
-   Sequelize ORM
-   PostgreSQL
-   JWT
-   bcryptjs
-   CORS
-   dotenv
-   REST APIs

**Deployment:** Render

### Database

-   PostgreSQL
-   Sequelize

**Hosting:** Render PostgreSQL

### Development and Deployment

-   Git
-   GitHub
-   npm
-   Vercel
-   Render

**Docker is not required in the current version.**

------------------------------------------------------------------------

## Project Structure

``` text
Artify/
│
├── artify-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── artify-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── admin.js
│   │   │   ├── auth.js
│   │   │   ├── catalog.js
│   │   │   └── shop.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

------------------------------------------------------------------------

## Backend API

The backend API is available under `/api`.

### Authentication

``` text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Other API areas

``` text
/api/admin
/api/catalog
/api/shop
/api/dashboard
/api/customers
/api/interventions
/api/analytics
/api/audit
```

The exact routes and request formats are defined in the backend route
files.

------------------------------------------------------------------------

## Database

The application uses PostgreSQL with Sequelize.

Main tables:

  Table           Purpose
  --------------- -------------------------------------
  `users`         Customer, artist and admin accounts
  `artists`       Artist profiles
  `products`      Artwork catalog
  `categories`    Artwork categories
  `carts`         Customer carts
  `cart_items`    Items in carts
  `orders`        Customer orders
  `order_items`   Products in orders
  `payments`      Payment records
  `reviews`       Product reviews

### User Roles

``` text
CUSTOMER
ARTIST
ADMIN
```

### Product Status

``` text
ACTIVE
SOLD
DRAFT
```

### Order Status

``` text
PENDING
CONFIRMED
SHIPPED
DELIVERED
CANCELLED
```

### Payment Methods

``` text
CREDIT_CARD
DEBIT_CARD
UPI
NET_BANKING
WALLET
CASH_ON_DELIVERY
```

### Payment Status

``` text
PENDING
COMPLETED
FAILED
REFUNDED
```

------------------------------------------------------------------------

## Authentication and Security

Artify uses:

-   **bcryptjs** for password hashing
-   **JWT** for authentication
-   Role-based access
-   Environment variables for secrets and database credentials
-   CORS configuration for frontend/backend communication

Production secrets are not stored in GitHub.

Important backend environment variables:

``` env
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRATION_MS=86400000

PORT=8081
FRONTEND_URL=
```

Never commit the real `.env` file.

------------------------------------------------------------------------

## Environment Configuration

### Frontend

Production API:

``` env
REACT_APP_API_URL=https://artify-9g2s.onrender.com/api
```

Local development:

``` env
REACT_APP_API_URL=http://localhost:8081/api
```

### Backend

Example local configuration:

``` env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artify_db
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRATION_MS=86400000

PORT=8081
FRONTEND_URL=http://localhost:5173
```

For production, the database credentials come from Render PostgreSQL and
`FRONTEND_URL` should point to the Vercel frontend.

------------------------------------------------------------------------

## Running Locally

### Backend

``` bash
cd artify-backend
npm install
node src/server.js
```

Backend:

``` text
http://localhost:8081
```

### Frontend

Open another terminal:

``` bash
cd artify-frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## Deployment

### Frontend --- Vercel

The React/Vite frontend is deployed on Vercel.

``` text
GitHub
   |
   v
Vercel
   |
   v
React + Vite
```

Live frontend:

https://artify-lilac-beta.vercel.app/

### Backend --- Render

The Node.js/Express backend is deployed as a Render Web Service.

``` text
GitHub
   |
   v
Render Web Service
   |
   v
Node.js + Express
```

Live backend:

https://artify-9g2s.onrender.com/

### PostgreSQL --- Render

``` text
Render Backend
      |
      v
Render PostgreSQL
```

Sequelize manages the PostgreSQL connection and models.

------------------------------------------------------------------------

## Application Data Flow

``` text
User
 |
 v
React Frontend
 |
 | HTTP REST API
 v
Express Backend
 |
 | Sequelize
 v
PostgreSQL
 |
 v
Backend Response
 |
 v
React UI
```

Example login flow:

``` text
Login Form
    |
    v
POST /api/auth/login
    |
    v
Express
    |
    v
PostgreSQL User Lookup
    |
    v
bcrypt Password Verification
    |
    v
JWT Generation
    |
    v
Frontend receives JWT
```

------------------------------------------------------------------------

## Sample Test Accounts

Development/test accounts include:

  Role       Email
  ---------- -----------------------
  Customer   `customer@artify.com`
  Artist     `artist@artify.com`
  Admin      `admin@artify.com`

Passwords are intentionally not documented in this public README.

------------------------------------------------------------------------

## Sample Artwork Data

The database can contain sample artwork across:

-   Paintings
-   Digital Art
-   Photography
-   Sculptures
-   Abstract Art

Each product can contain:

``` text
Title
Description
Price
Image URL
Stock
Status
Artist
Category
Created At
Updated At
```

This allows the complete catalog, cart and purchase flow to be tested.

------------------------------------------------------------------------

## Testing Flow

A typical customer test:

1.  Open the live frontend.
2.  Log in as a customer.
3.  Browse artworks.
4.  Open an artwork.
5.  Add it to the cart.
6.  Change quantity.
7.  Remove items if required.
8.  Continue to checkout.
9.  Place/test an order.
10. Check the order history.
11. Test reviews where available.

Artist and admin accounts can be used to test their respective
role-specific features.

------------------------------------------------------------------------

## Frontend ↔ Backend Connection

Production frontend:

``` text
https://artify-lilac-beta.vercel.app
```

Production API:

``` text
https://artify-9g2s.onrender.com/api
```

The backend production environment should use:

``` env
FRONTEND_URL=https://artify-lilac-beta.vercel.app
```

The frontend uses:

``` env
REACT_APP_API_URL=https://artify-9g2s.onrender.com/api
```

------------------------------------------------------------------------

## Migration from Java to Node.js

The original architecture used a Java/Spring Boot backend.

### Previous

``` text
React
  |
Spring Boot
  |
Database
```

### Current

``` text
React + Vite
  |
Node.js + Express
  |
Sequelize
  |
PostgreSQL
```

The current project no longer requires:

-   Java
-   Spring Boot
-   Maven
-   Docker

The backend is completely Node.js/Express based.

------------------------------------------------------------------------

## Why These Technologies?

### React + Vite

Component-based frontend development with fast development and
production builds.

### Node.js + Express

Lightweight, scalable REST API backend and JavaScript-based server
development.

### Sequelize

ORM for PostgreSQL models, relationships and database operations.

### PostgreSQL

Relational database suitable for users, products, carts, orders,
payments and reviews.

### JWT

Stateless authentication for API requests.

### bcryptjs

Secure password hashing.

### Vercel

Convenient deployment platform for the React/Vite frontend.

### Render

Hosting for the Express backend and PostgreSQL database.

------------------------------------------------------------------------

## Git Workflow

Repository:

https://github.com/Neerajvarma713/Artify

Typical workflow:

``` bash
git add .
git commit -m "Update Artify"
git push origin main
```

Configured Vercel and Render deployments can automatically redeploy
after GitHub changes.

------------------------------------------------------------------------

## Future Improvements

Possible enhancements:

-   Real payment gateway integration
-   Cloud image storage
-   Advanced search
-   Filtering and sorting
-   Wishlist
-   Artist dashboard analytics
-   Admin dashboard
-   Email notifications
-   Order tracking
-   Product recommendations
-   Automated tests
-   Swagger/OpenAPI documentation
-   Rate limiting
-   Additional production security
-   Image optimization
-   Pagination

------------------------------------------------------------------------

## Project Status

**Status:** Deployed

  Component        Technology          Hosting
  ---------------- ------------------- ---------
  Frontend         React + Vite        Vercel
  Backend          Node.js + Express   Render
  Database         PostgreSQL          Render
  ORM              Sequelize           Backend
  Authentication   JWT + bcryptjs      Backend
  Source Control   Git + GitHub        GitHub

------------------------------------------------------------------------

## Project Links

-   **Live Application:** https://artify-lilac-beta.vercel.app/
-   **Backend API:** https://artify-9g2s.onrender.com/
-   **GitHub Repository:** https://github.com/Neerajvarma713/Artify

------------------------------------------------------------------------

## License

This project is intended for educational, portfolio and demonstration
purposes unless a separate license is provided.
