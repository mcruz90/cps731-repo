# Serenity Wellness Platform

## Overview

This project is a wellness services management platform built with React + Vite for the frontend and Supabase for the backend. It provides features for managing appointments, practitioner services, and user profiles.

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Git](https://git-scm.com/)

## Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mcruz90/cps731-repo.git
   cd cps731-repo
   ```

2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Create a `.env` file in the `client` directory with our Supabase credentials (see group chat for details):

   ```plaintext
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

   ```plaintext
   client/
   ├── src/
   │   ├── components/     # Reusable UI components
   │   ├── context/       # React context providers
   │   ├── hooks/         # Custom React hooks
   │   ├── pages/         # Page components
   │   ├── services/      # API and utility services
   │   ├── theme/         # MUI theme configuration
   │   └── App.jsx        # Root component
   ├── .env              # Environment variables
   └── vite.config.js    # Vite configuration
   ```

## Key Features

- User authentication (login/register)
- Role-based access control (Client, Practitioner, Admin, Staff)
- Appointment booking system
- Report tracking for admin
- Messaging system for client and practitioner
- Product purchasing system for client

## Development Guidelines

### Environment Setup

- Use Node.js version 16 or higher
- Install recommended VS Code extensions:
  - ESLint
  - Prettier

### Code Style

- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component and function names

### Git Workflow

1. Create a new branch for each feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit with clear messages:

   ```bash
   git add .
   git commit -m "feat: add appointment booking functionality"
   ```

3. Push your changes and create a pull request:

   ```bash
   git push origin feature/your-feature-name
   ```

## Available Scripts

In the client directory, you can run:

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests (need to implement this)
