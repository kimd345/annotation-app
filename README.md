# Knowledge Unit Annotation Interface

This document outlines the approach for presenting the Knowledge Unit Annotation Interface application.

## Project Overview

The Knowledge Unit Annotation Interface is a web application that allows users to annotate units of knowledge based on raw text files (e.g., emails). The system enables structured information extraction from unstructured documents through a three-panel interface:

1. **Left Panel**: Document list that displays available documents and indicates which ones have annotations
2. **Middle Panel**: Document viewer that displays the selected document content with highlighted annotations
3. **Right Panel**: Knowledge Unit (KU) editor that allows users to create, edit, and manage annotations

## Data Model

```
┌───────────────┐       ┌───────────────────┐       ┌─────────────────┐
│   Document    │       │   KnowledgeUnit   │       │  KnowledgeUnit  │
├───────────────┤       ├───────────────────┤       │     Schema      │
│ id            │       │ id                │       ├─────────────────┤
│ title         │◄──┐   │ schemaId          │───────┤ frameId         │
│ content       │   │   │ documentId        │       │ frameLabel      │
│ fileName      │   │   │ fields            │       │ fields          │
│ hasAnnotations│   │   └───────────────────┘       └─────────────────┘
└───────────────┘   │             │                          │
                    │             │                          │
                    │             ▼                          ▼
                    │   ┌───────────────────┐       ┌─────────────────┐
                    │   │      Field        │       │   SchemaField   │
                    │   ├───────────────────┤       ├─────────────────┤
                    │   │ id                │       │ id              │
                    │   │ name              │       │ name            │
                    │   │ type              │◄──────┤ type            │
                    │   │ required          │       │ required        │
                    │   │ multiple          │       │ multiple        │
                    │   │ value             │       └─────────────────┘
                    │   │ highlights        │                │
                    │   └───────────────────┘                │
                    │             │                          │
                    │             ▼                          ▼
                    │   ┌───────────────────┐       ┌─────────────────┐
                    │   │     Highlight     │       │  CustomField    │
                    └───┤───────────────────┤       │     Type        │
                        │ id                │       ├─────────────────┤
                        │ startOffset       │       │ typeId          │
                        │ endOffset         │       │ typeLabel       │
                        │ text              │       │ fields          │
                        │ fieldId           │       └─────────────────┘
                        │ kuId              │
                        └───────────────────┘
```

## Application Architecture

The application follows a modular architecture organized by feature:

### Core Structure

```
src/
│
├── components/         # Reusable UI components
│   ├── fields/         # Field-specific components
│   ├── forms/          # Form-related components
│   └── highlights/     # Highlighting components
│
├── features/           # Feature-specific modules
│   ├── annotations/    # Annotation panel components
│   └── documents/      # Document list and viewer components
│
├── hooks/              # Custom React hooks
│
├── lib/                # Utilities and mock data
│   └── txt/            # Sample text documents
│
├── store/              # Zustand state management
│
├── types/              # TypeScript type definitions
│
└── utils/              # Utility functions
```

### State Management

The application uses Zustand for state management, with a single store that manages:

- Documents and their selection state
- Knowledge Unit schemas and instances
- Highlighting and annotation state
- Custom field types and modal state

### Key Technical Implementation Details

1. **Highlighting System**:
   - Text selection in document creates highlights
   - Highlights are stored with start/end offsets and linked to fields
   - Hover states show related highlights across panels

2. **Form Validation**:
   - Required field validation
   - Type-specific validation for different field types
   - Highlight validation to ensure evidence is provided

3. **Custom Field Types**:
   - Modal-based interface for complex field types (e.g., dates, locations)
   - Field type composition and validation

4. **Dynamic Fields**:
   - Required fields shown by default
   - Optional fields can be added/removed as needed
   - Support for multiple field instances

## Implementation Highlights

Notable implementations:

1. **Highlight System** (`src/hooks/use-highlighting.ts`)
   - Text selection and offset calculation
   - Highlight rendering and interaction

2. **Form Validation** (`src/hooks/use-field-validation.ts`, `src/utils/validation.ts`)
   - Field-type specific validation
   - Required field handling
   - Highlight validation

3. **State Management** (`src/store/use-annotation-store.ts`)
   - Unified store approach
   - Action creators and state updates
   - Cross-component state sharing

4. **Dynamic UI** (`src/features/annotations/ku-form.tsx`)
   - Form generation from schema
   - Optional field handling
   - Field type rendering

## Missing Features & Limitations

Limitations and missing features:

1. **Backend Integration**
   - Currently uses local mock data
   - Would need API integration for persistence and infinite scroll / pagination
   - Missing real-time storage writes

2. **Pagination/Infinite Scroll**
   - Document list currently loads all documents
   - Would need backend pagination support for large document sets

3. **Test Coverage**
   - Basic test structure in place
   - Would expand test coverage for production

## Technical Challenges & Solutions

Technical challenges and solutions:

1. **Text Highlighting**
   - Challenge: Mapping text selections to document offsets
   - Solution: Custom text offset calculation and non-overlapping highlight rendering

2. **Form State Management**
   - Challenge: Complex nested form state with validation
   - Solution: Combination of React Hook Form and custom validation

3. **Dynamic Field Types**
   - Challenge: Supporting various field types with different behaviors
   - Solution: Component composition and type-specific rendering

4. **Performance**
   - Challenge: Efficient rendering with potentially large documents
   - Solution: Optimized highlight rendering and state management
