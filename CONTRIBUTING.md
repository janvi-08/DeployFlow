# Contributing to DeployFlow

Contributions are welcome. Please follow these guidelines:

## Development Workflow
1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Install dependencies:
   ```bash
   npm install --prefix server
   npm install --prefix client
   ```
4. Run tests before submitting changes:
   ```bash
   cd server && npm test
   cd ../client && npm test
   ```
5. Ensure TypeScript passes without errors:
   ```bash
   cd server && npx tsc --noEmit
   cd ../client && npx tsc -b
   ```
6. Commit changes with clear messages adhering to Conventional Commits:
   - `feat: add new capability`
   - `fix: resolve issue with path resolution`
   - `docs: update setup documentation`
7. Push to your fork and submit a Pull Request against the `main` branch.

## Code Standards
- Keep business logic cleanly divided between controllers, middleware, and services.
- Never commit secrets, `.env` files, or local database directories.
- Always include test coverage for new endpoints or deployment features.
