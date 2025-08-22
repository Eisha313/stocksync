# Contributing to StockSync

Thank you for your interest in contributing to StockSync! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stocksync.git
   cd stocksync
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. Make your changes and test thoroughly

3. Run linting and type checking:
   ```bash
   npm run lint
   npm run type-check
   ```

4. Commit your changes following our commit message conventions

5. Push to your fork and create a pull request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define types in `src/types/` for shared types
- Avoid using `any` type; use `unknown` when necessary
- Use interfaces for object shapes, types for unions/primitives

### File Organization

```
src/
├── app/              # Next.js app router pages and API routes
├── components/       # React components
├── controllers/      # API controllers
├── lib/              # Utilities, constants, middleware
├── models/           # MongoDB models
├── services/         # Business logic services
└── types/            # TypeScript type definitions
```

### Naming Conventions

- **Files:** kebab-case (e.g., `product.controller.ts`)
- **Components:** PascalCase (e.g., `ProductCard.tsx`)
- **Functions/Variables:** camelCase (e.g., `getProductById`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces:** PascalCase (e.g., `ProductDocument`)

### Code Style

- Use ESLint and Prettier configurations provided
- Maximum line length: 100 characters
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused

### Example Code Style

```typescript
import { Product } from '@/types';

/**
 * Calculates the restock quantity needed for a product.
 * @param product - The product to calculate for
 * @param targetStock - Desired stock level
 * @returns The quantity to order
 */
export function calculateRestockQuantity(
  product: Product,
  targetStock: number
): number {
  const currentStock = product.quantity;
  const needed = targetStock - currentStock;
  
  return Math.max(0, needed);
}
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Examples

```
feat(alerts): add SMS notification support

fix(inventory): correct threshold comparison logic

docs(api): update authentication section

refactor(services): extract common validation logic
```

## Pull Requests

1. **Title:** Use a clear, descriptive title following commit message format

2. **Description:** Include:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots for UI changes

3. **Checklist:**
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated if needed
   - [ ] No new warnings introduced

4. **Link Issues:** Reference related issues with `Fixes #123` or `Closes #456`

## Reporting Bugs

When reporting bugs, please include:

1. **Description:** Clear description of the bug
2. **Steps to Reproduce:** Detailed steps to reproduce the issue
3. **Expected Behavior:** What you expected to happen
4. **Actual Behavior:** What actually happened
5. **Environment:**
   - OS and version
   - Node.js version
   - Browser (if applicable)
6. **Screenshots/Logs:** Any relevant visual evidence or error logs

## Requesting Features

For feature requests, please include:

1. **Problem Statement:** What problem does this solve?
2. **Proposed Solution:** How should it work?
3. **Alternatives Considered:** Other solutions you've thought about
4. **Additional Context:** Any other relevant information

---

Thank you for contributing to StockSync! 🎉
