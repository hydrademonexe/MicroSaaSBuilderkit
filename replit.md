# Overview

This is a Micro-SaaS application called "SalgadosPro" designed for Brazilian savory snack entrepreneurs. The application helps small business owners (primarily women 35+) manage their baking businesses by providing tools for pricing calculation, inventory management, customer relationships, sales tracking, and production planning. The system uses a local-first approach with IndexedDB for data storage, eliminating the need for server-side databases and making it accessible for users with limited technical expertise.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, mobile-first design
- **Styling**: Tailwind CSS with custom color scheme (red #D62828 and gold #FFD700) optimized for food/restaurant aesthetics
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for data fetching and caching, with custom hooks for database operations
- **Layout**: Mobile-first responsive design with bottom navigation for touch-friendly interaction

## Backend Architecture
- **Server**: Express.js with TypeScript, structured for potential API expansion
- **Development**: Hot reload with Vite middleware integration
- **Storage Interface**: Abstracted storage layer with both in-memory and database implementations
- **Data Models**: Shared schema definitions between client and server using Drizzle ORM

## Data Storage Solutions
- **Primary Storage**: IndexedDB for client-side data persistence (local-first approach)
- **Fallback**: In-memory storage for development/testing
- **Schema Management**: Drizzle ORM with PostgreSQL dialect for potential server-side scaling
- **Database Structure**: Optimized for small business workflows with entities for recipes, ingredients, customers, orders, reports, production tasks, and alerts

## Authentication and Authorization
- **Current State**: Basic user schema defined but authentication not implemented
- **Design**: Prepared for simple username/password authentication with user sessions
- **Security**: Framework in place for adding authentication middleware

## External Dependencies
- **UI Components**: Comprehensive Radix UI component library for accessibility
- **Database**: Neon serverless PostgreSQL for potential cloud deployment
- **Development Tools**: ESBuild for production builds, TypeScript for type safety
- **Fonts**: Google Fonts integration (Poppins) for clean, readable typography
- **Icons**: Lucide React for consistent iconography

The architecture prioritizes simplicity and offline-first functionality, making it ideal for small business owners who need reliable tools without complex setup requirements. The modular design allows for future expansion while maintaining the current local-storage approach.