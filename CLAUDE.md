# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- Testing: Tests use Jest syntax with react-testing-library

## Code Style
- Use TypeScript with strict typing
- Components use `.tsx` extension, utilities use `.ts`
- Prefer functional components and React Hooks
- Form validation uses react-hook-form with validation.ts utilities
- File names use kebab-case
- Component names use PascalCase
- State management with Zustand (use-annotation-store.ts)
- Imports organized by: React/libraries, components, utilities/types
- Annotations follow Document -> KnowledgeUnit -> Fields -> Highlights structure
- Return true/string pattern for validation (true = valid, string = error message)
- Custom field types should implement validateCustomFieldHasValue

## Remaining Tasks
- <del>Refactor large components into maintainable modules</del>
- <del>Refine TypeScript types to match linting and tsconfig, and fix TypeScript errors across files</del>
- Replace mock data flow with tanstack-query integration to a simple backend server (with local JSON storage instead of a database) that supports infinite scroll for documents list and dynamic lists
- Implement real-time JSON storage write to backend
- Generate tests for all major units and user flows
- Create comprehensive documentation for product demo and code run-through