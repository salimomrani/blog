# Gemini Project Context: Angular Blog

This document provides a comprehensive overview of the Angular Blog project, designed to serve as a persistent context for the Gemini AI assistant.

## Project Overview

This is a modern Angular application that implements a blog platform. It is built with TypeScript and utilizes the latest Angular features, including standalone components and NgRx Signal Store for state management. The UI is styled with Tailwind CSS.

The application features include:
- User authentication (login/register).
- Article management (create, read, update, delete).
- User profile management.
- Admin-only sections for user and category/tag management.

The project follows a feature-based architecture with lazy-loaded modules for better performance.

## Building and Running

### Key Commands

-   **Start Development Server:**
    ```bash
    npm start
    ```
    This runs the application in development mode on `http://localhost:4200`.

-   **Build for Production:**
    ```bash
    npm run build
    ```
    This builds the application for production, with outputs in the `dist/` directory.

-   **Run Unit Tests:**
    ```bash
    npm test
    ```
    This executes the unit tests using Jest.

-   **Lint the Code:**
    ```bash
    npm run lint
    ```
    This runs ESLint to check for code quality and style issues.

## Development Conventions

This project adheres to a strict set of development conventions to ensure code quality, consistency, and maintainability.

### Coding Style

-   **Angular Best Practices:** The codebase follows modern Angular practices, including the use of standalone components, functional guards, and NgRx Signal Store.
-   **ESLint:** A comprehensive ESLint setup (`eslint.config.js`) is in place to enforce coding standards, including:
    -   Component selectors must be prefixed with `app-` (e.g., `<app-my-component>`).
    -   Directive selectors use `app` as a prefix in camelCase (e.g., `appMyDirective`).
    -   Strict TypeScript rules, such as disallowing `any` and requiring explicit return types.
-   **Prettier:** Code formatting is handled by Prettier, with rules defined in `package.json`.

### State Management

-   **NgRx Signal Store:** The application uses NgRx Signal Store for reactive state management. Stores are defined for different features (e.g., `ArticlesStore`, `AuthStore`).
-   Each store encapsulates its state, computed properties, and methods for interacting with the state.

### Git and Commits

-   **Commit Messages:** The project follows the Conventional Commits specification. See `BEST_PRACTICES.md` for detailed guidelines.
-   **Branching Strategy:** A feature-branch workflow is recommended (e.g., `feature/add-comments`, `fix/login-bug`).

### Testing

-   **Unit Testing:** Jest is the framework for unit tests. Test files are co-located with their corresponding source files (e.g., `articles.service.spec.ts`).
-   **Testing Philosophy:** The project emphasizes testing behavior rather than implementation, following the Arrange-Act-Assert (AAA) pattern.

### Documentation

-   The `BEST_PRACTICES.md` file is the single source of truth for all development guidelines, covering everything from code quality and security to CI/CD and error handling. It is recommended to review it thoroughly.
