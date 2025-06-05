# Task Management Frontend

A React-based task management application with AWS Amplify authentication and deployment.

## Live Demo

The application is live at: [https://main.d1e0m8cgn04b37.amplifyapp.com/admin/](https://main.d1e0m8cgn04b37.amplifyapp.com/admin/)

## Features

- User authentication via AWS Cognito
- Role-based access (Admin/Member)
- Task creation and management
- Responsive UI

## Setup

### Prerequisites

- Node.js (v16+)
- pnpm
- AWS account with Cognito User Pool

### Environment Variables

Create `.env` for development and `.env.production` for production:

```code
VITE_API_BASE_URL=http://localhost:3000
VITE_USER_POOL_ID=eu-west-1_xxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://your-domain.auth.region.amazoncognito.com
```

### Installation

```bash
pnpm install
pnpm run dev
```

## Deployment

See [AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

- `/src/components` - UI components
- `/src/context` - React context providers
- `/src/tasks` - Task-related components
- `/src/types` - TypeScript type definitions
