# Angular Blog Project

This is a modern Angular application that implements a blog platform. It is built with TypeScript and utilizes the latest Angular features, including standalone components and NgRx Signal Store for state management. The UI is styled with Tailwind CSS.

## Features

-   User authentication (login/register).
-   Article management (create, read, update, delete).
-   User profile management.
-   Admin-only sections for user and category/tag management.

## Technology Stack

-   **Angular 20.3**: Frontend framework with standalone components and Angular Signals.
-   **TypeScript 5.9**: Primary programming language.
-   **NgRx Signal Store**: For reactive state management.
-   **Tailwind CSS**: For styling the user interface.
-   **Jest**: For unit testing.
-   **Spring Boot**: Backend API (communicates with `http://localhost:8080/api`).

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:

-   Node.js (LTS version recommended)
-   npm (comes with Node.js)
-   Angular CLI (`npm install -g @angular/cli`)
-   Docker and Docker Compose (for running the backend or if you prefer containerized development)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd angular-blog
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

### Running the Development Server

To start the Angular development server:

```bash
npm start
```

This will run the application in development mode on `http://localhost:4200`. The application will automatically reload if you change any of the source files.

### Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

To execute the unit tests using Jest:

```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

For coverage report:
```bash
npm run test:coverage
```

### Linting

To run ESLint to check for code quality and style issues:

```bash
npm run lint
```

To automatically fix linting errors where possible:

```bash
npm run lint:fix
```

## Docker Development

If you prefer to run the frontend in a Docker container with live reload:

```bash
docker compose up --build
```

This will build and start the frontend container. The application will be accessible at `http://localhost:4200` and will automatically reload on source code changes.

To stop the containers:

```bash
docker compose down
```

## Further Documentation

-   `BEST_PRACTICES.md`: Universal best practices for development.
-   `CLAUDE.md`: Specific guidance for Claude Code AI assistant.
-   `GEMINI.md`: Specific guidance for Gemini AI assistant.