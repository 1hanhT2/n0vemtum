# replit.md

## Overview

This project is **n0ventum**, a modern habit tracking web application built with a full-stack TypeScript architecture. The application combines gamification elements, AI-powered insights, and comprehensive analytics to help users build and maintain healthy habits. It features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom theming and mobile-first responsive design
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with consistent error handling and validation
- **Build System**: esbuild for production builds, tsx for development

### Authentication System
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Express sessions with PostgreSQL store
- **Strategy**: Passport.js with OpenID Connect strategy
- **Security**: CSRF protection, secure headers, and httpOnly cookies

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL 16 (Neon serverless for production)
- **Migration System**: Drizzle Kit for schema migrations
- **Connection**: Connection pooling with @neondatabase/serverless

### Core Data Models
- **Users**: Profile management with OAuth integration
- **Habits**: Core habit tracking with gamification fields
- **Daily Entries**: Daily completion tracking and reflection
- **Weekly Reviews**: Weekly reflection and goal setting
- **Achievements**: Badge system for user engagement
- **Streaks**: Streak tracking for consistency motivation
- **Settings**: User preference management

### AI Integration
- **Provider**: Google Gemini AI (multiple model fallback)
- **Features**: 
  - Habit difficulty analysis
  - Personalized suggestions
  - Weekly insights generation
  - Motivational messaging
- **Caching**: In-memory caching system to reduce API calls

### Gamification System
- **Levels**: XP-based progression system
- **Tiers**: Long-term mastery recognition (Bronze → Diamond)
- **Streaks**: Daily and weekly consistency tracking
- **Achievements**: Comprehensive badge system with 23 achievements across categories:
  - Streak achievements (First Steps, Getting Started, Week Warrior, Monthly Master, etc.)
  - Milestone achievements (Getting Into It, Century Club, Habit Master)
  - Completion achievements (Perfect Day, Near Perfect)
  - Consistency achievements (Reflection Master, Self-Aware)
  - Special achievements (Early Bird, Habit Creator, Perfectionist)
- **Mastery Points**: Advanced progression metrics

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: OAuth redirect → session creation → user profile fetch
2. **Habit Management**: CRUD operations with optimistic updates
3. **Progress Tracking**: Real-time completion updates with gamification calculations
4. **AI Insights**: Cached responses with fallback strategies

### State Management Pattern
- **Server State**: TanStack Query for API data with intelligent caching
- **Local State**: React hooks for component-specific state
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and pooling
- **@google/genai**: AI integration for insights and suggestions
- **@radix-ui/***: Accessible UI primitives
- **drizzle-orm**: Type-safe database operations
- **passport**: Authentication middleware
- **express-session**: Session management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first styling framework
- **ESLint + Prettier**: Code quality and formatting

## Deployment Strategy

### Replit Environment
- **Development**: `npm run dev` with hot reload
- **Production Build**: `npm run build` creates optimized bundles
- **Production Server**: `npm run start` serves built application
- **Database**: Automatic PostgreSQL provisioning via Replit

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Development**: Auto-configured with Replit modules
- **Production**: Environment variables for database and API keys
- **Scaling**: Autoscale deployment target for traffic handling

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Recent Changes

✓ Fixed authentication session persistence issues with Replit accounts by improving cookie settings and session management
✓ Implemented comprehensive request protection against button spamming:
  - Added debouncing for habit toggle actions (300ms delay)
  - Added throttling for habit card interactions (500ms cooldown)
  - Added pending state protection for critical actions (day completion, data reset)
  - Implemented server-side rate limiting (100 requests/15min general, 10 requests/min for sensitive endpoints)
✓ Enhanced day completion functionality with better error handling and request protection
✓ Fixed AI weekly insights display by updating component to match API response structure
✓ Completed comprehensive achievement system with 23 achievements across multiple categories
✓ Implemented comprehensive SEO optimization for search engine indexing
✓ Resolved all runtime errors related to missing hook imports and function definitions
✓ Cleaned up redundant code and improved code organization
✓ Fixed critical bugs in temporary storage system:
  - Removed duplicate function calls in habit toggle
  - Fixed state synchronization issues with localStorage
  - Prevented race conditions in batch habit processing
  - Added proper error handling for localStorage operations
  - Fixed memory leak potential in debounced functions
  - Corrected hardcoded user ID in badge system

## Changelog

```
Changelog:
- June 24, 2025: Initial setup and core functionality
- January 21, 2025: Fixed AI insights display, completed achievement system implementation
- January 21, 2025: Implemented comprehensive request protection and rate limiting to handle button spam
- January 21, 2025: Resolved all runtime errors and stabilized application with proper hook implementations
```