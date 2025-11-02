# Gemini Project: Angular Blog

This document provides a comprehensive overview of the Angular Blog project, designed to facilitate seamless onboarding and effective collaboration for developers using Gemini.

## Project Overview

The project is a modern blog application built with Angular, utilizing a component-based architecture and standalone components. It features a landing page with sections for hero content, features, recent articles, and a call-to-action. The application is set up with a development server, build process, and unit testing using Jest.

### Key Technologies

- **Framework:** Angular
- **Styling:** Tailwind CSS, SCSS
- **Testing:** Jest
- **Linting:** ESLint
- **Package Manager:** npm

### Architecture

The application follows a standard Angular project structure:

- `src/`: Contains the main application code.
- `src/app/`: The core of the application, with components, routes, and services.
- `src/app/features/`: Feature modules, such as the landing page.
- `src/app/shared/`: Shared models, services, and components.
- `angular.json`: Configuration for the Angular CLI, including build and serve settings.
- `package.json`: Lists project dependencies and scripts.

## Building and Running

### Development Server

To start the development server, run:

```bash
npm start
```

This will launch the application on `http://localhost:4200/`, with hot-reloading enabled.

### Building

To build the project for production, run:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Testing

To run the unit tests, use:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate a test coverage report:

```bash
npm run test:coverage
```

## Development Conventions

### Coding Style

The project uses ESLint for code linting and Prettier for code formatting. To check for linting errors, run:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

### Git

This project uses a conventional commit message format. Before committing, please ensure your commit messages are clear and descriptive.

### Contribution Guidelines

When contributing to the project, please follow these steps:

1.  Create a new branch for your feature or bug fix.
2.  Make your changes, adhering to the coding style and conventions.
3.  Write unit tests for any new functionality.
4.  Ensure all tests pass.
5.  Submit a pull request with a clear description of your changes.
