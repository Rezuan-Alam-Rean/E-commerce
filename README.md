# Enterprise-Level Full Stack E-commerce Website (2026)

Premium, full-stack ecommerce experience built with the Next.js App Router, MongoDB, Mongoose, and JWT authentication. The UI focuses on a clean, modern, premium aesthetic with reusable components and scalable architecture.

## Features

- JWT auth with HTTP-only cookies
- Role-based access for users and admins
- Product catalog with filters, sorting, and pagination-ready API
- Cart, wishlist, and checkout flow (Cash on Delivery)
- Admin analytics summary and order management
- Mongoose models with timestamps and indexing
- Zod validation and centralized response helpers

## Tech Stack

- Next.js App Router + TypeScript
- MongoDB + Mongoose
- JWT + bcrypt
- Zustand state management
- Tailwind CSS

## Getting Started

1. Copy .env.example to .env and fill in the required values.
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## Environment Variables

- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- APP_ORIGIN
- ADMIN_EMAIL
- ADMIN_PASSWORD

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint
