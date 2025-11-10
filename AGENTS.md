# Repository Guidelines

## Project Structure & Module Organization
The Angular app lives under `src/`, with bootstrapping in `main.ts` and feature areas in `src/app/features`. Shared UI primitives, pipes, and directives sit in `src/app/shared`, while cross-cutting utilities (guards, interceptors, services, NgRx store) have their own sibling folders for easy discovery. Environment-specific configuration files live in `src/environments`. Generated builds land in `dist/`; long-form references (deployment, architecture, API contracts) are in `docs/`, and container/Kubernetes assets are in `Dockerfile*`, `docker-compose.yml`, and `k8s/`.

## Build, Test & Development Commands
- `npm start`: launches `ng serve` with hot reload on `http://localhost:4200`.
- `npm run build`: produces an optimized bundle in `dist/` using the Angular CLI config in `angular.json`.
- `npm run watch`: incremental rebuilds for local authoring.
- `npm run test`, `npm run test:watch`, `npm run test:coverage`: run Jest once, in watch mode, or with coverage reports written to `coverage/`.
- `npm run lint` / `npm run lint:fix`: execute Angular ESLint with optional auto-fixes.

## Coding Style & Naming Conventions
TypeScript files use 2-space indentation, `printWidth` 100, and single quotes per the repo Prettier config. Prefer standalone components with clearly named selectors (e.g., `app-article-card`). Observable streams end with `$`, NgRx feature slices live under `src/app/store`, and feature files follow Angular naming (`feature-name.component.ts`, `.service.ts`, `.spec.ts`). Tailwind is configured via `tailwind.config.js`; keep utility classes close to their templates and purge unused styles.

## Testing Guidelines
Unit specs sit beside their sources as `*.spec.ts` and run through `jest-preset-angular` (configured in `setup-jest.ts`). Use the Angular Testing Library patterns for components and mock HTTP services via `HttpTestingController`. Keep coverage healthy (`npm run test:coverage`) and ensure reducers/effects have deterministic tests. Snapshot tests belong in feature folders; delete obsolete snapshots when behavior changes.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern seen in history (`feat(articles): …`, `fix(auth): …`). Group related changes per commit, keep the subject under 72 characters, and describe the why in the body if non-obvious. PRs should:
- Describe motivation, approach, and testing (`npm run test`, `npm run lint`).
- Link GitHub issues or product specs.
- Add before/after screenshots or GIFs for UI adjustments.
- Note config or schema migrations so reviewers can reproduce locally.
