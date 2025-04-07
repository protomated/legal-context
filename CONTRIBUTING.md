# Contributing to LegalContext

Thank you for your interest in contributing to LegalContext! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bug reports help us improve LegalContext. To report a bug:

1. Check the [GitHub Issues](https://github.com/protomated/legal-context/issues) to see if the bug has already been reported
2. If not, create a new issue using the Bug Report template
3. Provide a clear title and description
4. Include steps to reproduce the issue
5. Add information about your environment (OS, Bun version, etc.)
6. Add relevant screenshots or logs if possible

### Suggesting Enhancements

We welcome suggestions for enhancements:

1. Check existing issues to see if your idea has already been suggested
2. Create a new issue using the Feature Request template
3. Clearly describe the enhancement and its benefits
4. Provide examples of how the enhancement would work

### Pull Requests

We welcome pull requests for bug fixes and enhancements:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes, following our coding conventions
4. Add or update tests as necessary
5. Ensure all tests pass
6. Update documentation to reflect your changes
7. Submit a pull request

For significant changes, please open an issue to discuss before submitting a pull request.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) 1.0 or higher (for runtime and package management)
- [PostgreSQL](https://www.postgresql.org/) 15 or higher with pgvector extension
- [Claude Desktop](https://claude.ai/desktop) (for testing MCP integration)
- Git

### Local Development Environment

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/legal-context.git
   cd legal-context
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start PostgreSQL:
   ```bash
   # If using Docker
   docker-compose up -d postgres-dev
   ```

5. Build the project:
   ```bash
   bun run build
   ```

6. Run tests:
   ```bash
   bun test
   ```

7. Start the development server:
   ```bash
   bun run start:dev
   ```

### Project Structure

- `src/` - Source code
  - `app.module.ts` - Main application module
  - `main.ts` - Application entry point
  - `mcp/` - MCP server implementation
  - `clio/` - Clio document management API integration
  - `document-processing/` - Document processing engine
  - `database/` - Database entities and repositories
  - `config/` - Configuration handling
  - `utils/` - Utility functions
- `test/` - Test files
- `docs/` - Documentation
- `docker/` - Docker configuration for development and deployment

## Coding Conventions

- Use TypeScript for all new code
- Follow NestJS architecture patterns
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages
- Include JSDoc comments for all public APIs
- Write tests for all new features and bug fixes

## Documentation

- Update documentation in the `docs/` directory as needed
- Document all public APIs with JSDoc comments
- Include inline comments for complex logic
- Use mermaid syntax for diagrams in documentation

## Security Considerations

As LegalContext deals with sensitive legal documents, security is a top priority:

- Never commit credentials or sensitive information
- Always use proper authentication and authorization
- Follow OAuth 2.0 best practices for Clio integration
- Ensure document content remains within the firm's security perimeter
- Write tests to verify security constraints

## Legal

By contributing to LegalContext, you agree that your contributions will be licensed under the project's [Mozilla Public License 2.0](LICENSE).

## Questions?

If you have any questions about contributing, please open an issue or contact us at [dele@protomated.com](mailto:dele@protomated.com).

Thank you for contributing to LegalContext!
