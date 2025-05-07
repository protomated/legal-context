# LegalContext Project Guidelines

## Table of Contents
- [Introduction](#introduction)
- [Code Structure](#code-structure)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Security Guidelines](#security-guidelines)
- [Performance Considerations](#performance-considerations)
- [Contribution Guidelines](#contribution-guidelines)
- [Release Process](#release-process)

## Introduction

LegalContext is an open-source Model Context Protocol (MCP) server that creates a secure bridge between a law firm's Clio document management system and Claude Desktop AI assistant. These guidelines ensure the integrity, security, and maintainability of the project.

## Code Structure

The project follows a modular structure:

- `src/`: Main source code
  - `clio/`: Clio API integration
  - `documents/`: Document processing and management
  - `resources/`: Static resources and configurations
  - `tools/`: Utility scripts and tools
  - `tests/`: Test files
- `bin/`: Executable scripts
- `dist/`: Compiled output
- `.junie/`: Project documentation and planning
- `.github/`: GitHub workflows and CI/CD configurations

## Coding Standards

### TypeScript Standards

- Use TypeScript for all new code
- Follow the configuration in `tsconfig.json`
- Enable strict type checking
- Use ESNext features as configured

### Style Guidelines

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Follow camelCase for variables and functions, PascalCase for classes and interfaces
- Add appropriate JSDoc comments for public APIs
- Keep functions small and focused on a single responsibility
- Limit line length to 100 characters where possible

### Import Structure

- Use the `@/*` path alias for imports from the `src/` directory
- Group imports in the following order:
  1. Node.js built-in modules
  2. External dependencies
  3. Internal modules (using path aliases)
  4. Relative imports

## Development Workflow

### Environment Setup
- Use Bun as the JavaScript runtime and package manager
- Copy `.env.example` to `.env` and configure appropriately
- Follow the installation instructions in the README.md

### Branch Strategy

- `main`: Production-ready code
- Feature branches: Create from `main` for new features
- Use descriptive branch names (e.g., `feature/add-document-search`)

### Commit Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- Use semantic commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding or modifying tests
  - `chore:` for maintenance tasks

## Testing Guidelines

- Write tests for all new features and bug fixes
- Place tests in the `src/tests/` directory
- Use the testing scripts defined in `package.json`
- Test both happy paths and edge cases
- Ensure tests are independent and can run in any order

## Documentation Standards

- Keep README.md up-to-date with installation and usage instructions
- Document public APIs with JSDoc comments
- Update `.junie/` documentation when making significant changes
- Include examples for complex functionality

## Security Guidelines

- Never commit sensitive information (API keys, credentials)
- Use environment variables for configuration
- Follow the principle of least privilege
- Validate and sanitize all user inputs
- Keep dependencies updated to avoid security vulnerabilities
- Ensure all document processing happens locally as promised

## Performance Considerations

- Optimize database queries and vector searches
- Be mindful of memory usage, especially with large documents
- Consider the impact of changes on the free tier limitations
- Profile performance for critical operations

## Contribution Guidelines

- Fork the repository and create a feature branch
- Ensure all tests pass before submitting a pull request
- Follow the coding standards and commit guidelines
- Include tests for new functionality
- Update documentation as needed
- Be responsive to code review feedback

## Release Process

The project uses semantic-release for versioning and publishing:

- Releases are triggered automatically on merges to `main`
- Version numbers follow [Semantic Versioning](https://semver.org/)
- Release notes are generated from commit messages
- Packages are published to npm
- Docker images are built and pushed to Docker Hub

Adhering to these guidelines ensures the LegalContext project maintains high quality, security, and usability standards while facilitating collaboration among contributors.
