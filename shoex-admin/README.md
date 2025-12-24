# SHOEX Admin Dashboard

Frontend admin dashboard for SHOEX e-commerce platform built with React, Vite, Apollo Client, and Material-UI.

## Features

- **Authentication**: Login/logout with JWT tokens
- **Dashboard**: Overview with key metrics
- **User Management**: View and manage users
- **Product Management**: View and manage products
- **Store Management**: View and manage stores
- **Voucher Management**: Placeholder (backend not implemented)
- **Order Management**: Placeholder (backend not implemented)

## Prerequisites

- Node.js 16+
- Backend SHOEX server running on `http://localhost:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Backend Requirements

Make sure your SHOEX backend is running and exposes the following GraphQL endpoints:

- `/graphql/` - GraphQL playground
- User queries/mutations (implemented)
- Product queries/mutations (implemented)
- Store queries/mutations (implemented)
- Voucher queries/mutations (TODO: implement in backend)
- Order queries/mutations (TODO: uncomment in `graphql_api/api.py`)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GRAPHQL_URL=http://localhost:8000/graphql/
```

## Project Structure

```
src/
├── apollo/
│   └── client.ts          # Apollo Client configuration
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── layouts/
│   └── DashboardLayout.tsx # Main dashboard layout
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Dashboard.tsx      # Dashboard overview
│   ├── Users.tsx          # User management
│   ├── Products.tsx       # Product management
│   ├── Stores.tsx         # Store management
│   ├── Vouchers.tsx       # Voucher management (placeholder)
│   └── Orders.tsx         # Order management (placeholder)
├── graphql/
│   ├── queries.ts         # GraphQL queries
│   └── mutations.ts       # GraphQL mutations
├── App.tsx                # Main app component
├── main.tsx               # App entry point
└── index.css              # Global styles
```

## Usage

1. Start the backend server
2. Run `npm run dev`
3. Login with admin credentials
4. Navigate through the dashboard to manage users, products, and stores

## Development

- Uses TypeScript for type safety
- Material-UI for consistent UI components
- Apollo Client for GraphQL integration
- React Router for navigation

## Build for Production

```bash
npm run build
```

## Notes

- Voucher and Order management pages are placeholders until backend GraphQL APIs are implemented
- Update GraphQL endpoint URL in `apollo/client.ts` if backend runs on different port
- Token refresh is not implemented yet - add if needed
