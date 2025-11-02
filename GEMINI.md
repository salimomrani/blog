# GEMINI Project Analysis: Angular Blog

## 1. Project Overview

This repository contains a modern, full-stack blog application built with **Angular** (version 20.3.8). The project is well-structured, featuring a clean separation of concerns and a component-based architecture. It is designed for containerization and cloud-native deployment, with comprehensive configurations for **Docker** and **Kubernetes**.

### Key Technologies & Features:

*   **Frontend:** Angular, TypeScript, Tailwind CSS
*   **State Management:** NgRx (Store, Effects, Signals) for robust and predictable state handling.
*   **Testing:** Jest for unit testing.
*   **Linting:** ESLint with custom rules to enforce code quality and consistency.
*   **Containerization:**
    *   `Dockerfile` for creating a production-ready Nginx server to serve the built application.
    *   `Dockerfile.dev` and `docker-compose.yml` for a consistent local development environment with live reloading.
*   **Deployment:**
    *   Kubernetes manifests (`deployment.yaml`, `service.yaml`, `ingress.yaml`) are located in the `k8s/` directory.
    *   A GitHub Actions workflow (`.github/workflows/ci.yml`) automates the CI/CD pipeline: linting, testing, building, and deploying to a Kubernetes cluster.
    *   Detailed deployment instructions are available in `QUICK_START_K8S_DEPLOYMENT.md`.

### Architecture:

The application follows a standard Angular structure. The main application logic resides in `src/app`. The routing is defined in `src/app/app.routes.ts`, with the primary view being the `LandingComponent`. The project uses standalone components, which is a modern Angular practice.

## 2. Building and Running

### Local Development

There are two ways to run the application locally:

**1. Using Angular CLI (Recommended for UI development):**

```bash
# Install dependencies
npm install

# Run the development server
npm start
```

The application will be available at `http://localhost:4200/` with live reload enabled.

**2. Using Docker Compose (for a containerized environment):**

```bash
# Build and start the container
docker-compose up --build
```

This uses `Dockerfile.dev` to create a development image and runs the application on `http://localhost:4200/`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The build artifacts will be placed in the `dist/blog/browser` directory.

### Testing

The project uses Jest for unit testing.

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate a coverage report
npm run test:coverage
```

Test files are co-located with the source files and have a `.spec.ts` extension.

## 3. Development Conventions

### Linting

The project uses ESLint to enforce code style and best practices.

```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

The configuration is in `eslint.config.js` and enforces rules for both TypeScript and Angular templates.

### Git & Commits

While not explicitly defined, the presence of a `.git` directory implies standard Git workflows. It is recommended to follow conventional commit message formats (e.g., Conventional Commits).

### CI/CD

All pushes to the `master` branch will trigger the CI/CD pipeline defined in `.github/workflows/ci.yml`. This pipeline will:
1.  Run linting and tests.
2.  Build the Angular application.
3.  Build and push a Docker image to a container registry.
4.  Deploy the new image to the Kubernetes cluster.

Refer to `QUICK_START_K8S_DEPLOYMENT.md` for more details on the deployment process.
