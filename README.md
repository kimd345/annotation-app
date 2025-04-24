# Annotation App

Left Panel: Paginated list

Middle Panel: Scrollable list

Right Panel: Scrollable list

NoSQL like MongoDB might be better if the scope and intention involves handling nested or semi-structured data.
ie. Document -> text -> highlight -> annotation -> fields


---------------------------

# Form Validation Implementation Guide

This guide explains how validation has been implemented in the annotation application, following the requirements from the documentation.

## Core Validation Requirements

1. **Required Fields**
   - All fields marked as `required: true` must have valid values
   - Clear error messages are displayed near the relevant fields
   - Form submission is blocked until all required fields are valid

2. **Highlight Evidence**
   - All fields with values require corresponding evidence highlights
   - Visual indicators show when highlights are missing
   - Badge counts show the number of highlights per field

3. **Custom Type Validation**
   - For custom types (like dates and locations), at least one field must have a value
   - Custom validation logic prevents saving empty custom field objects

4. **Field Type Validation**
   - String fields validate text input
   - Integer fields validate number format with regex pattern
   - Dropdown fields only allow selection from provided options
   - Dynamic lists are validated appropriately

5. **Global Validation**
   - The export function validates all Knowledge Units before allowing export
   - A validation summary shows all errors across the document
   - Knowledge Units can be individually validated

## Implementation Details

### 1. Form Setup with react-hook-form

```tsx
// Using FormProvider for form context
const methods = useForm<FormData>({
  mode: 'onChange', // Validate on change for immediate feedback
  defaultValues: {
    fields: ku?.fields.map(field => ({
      id: field.id,
      value: field.value || '',
      highlights: field.highlights || []
    })) || []
  }
});
```

### 2. Field Input Validation

Each field validates based on:
- Required status
- Field type (string, integer, array, custom)
- Presence of highlights (when value exists)

Example validation rules:

```tsx
const getValidationRules = () => {
  const rules: any = {};
  
  // Required field validation
  if (required) {
    rules.required = `${name} is required`;
  }
  
  // Type-specific validation
  if (type === 'integer') {
    rules.pattern = {
      value: /^-?\d+$/,
      message: 'Please enter a valid integer',
    };
  }
  
  // Add highlight validation
  rules.validate = {
    highlights: (value: any) => validateHighlights(fieldHighlights, id, required)
  };
  
  return rules;
};
```

### 3. Custom Field Type Validation

For complex custom types like dates and locations:

```tsx
// Validate that at least one field has a value
const hasValue = Object.values(data).some(
  (value) => value !== null && value !== undefined && value !== ''
);

if (!hasValue) {
  setValidationError('At least one field must have a value');
  return;
}
```

### 4. Highlight Validation

Highlighting is required for all fields with values:

```tsx
// Custom validation function for highlights
const validateHighlights = (highlights: any[], fieldId: string, required: boolean) => {
  // Skip validation for optional fields with no value
  const fieldValue = getValues(`fields.${index}.value`);
  const isEmpty = fieldValue === '' || fieldValue === null || 
                 (Array.isArray(fieldValue) && fieldValue.length === 0);
  
  if (!required && isEmpty) {
    return true;
  }
  
  // All fields with values should have highlights
  return highlights && highlights.length > 0 || 'Evidence highlighting required';
};
```

### 5. Error Display

Errors are displayed in multiple ways:
- Inline error messages under each field
- Visual highlight indicators (color changes and badges)
- Validation summary before export

## Validation Utility Functions

The `validation.ts` utility provides reusable validation functions:

1. `validateCustomFieldHasValue` - Ensures custom fields have at least one value
2. `validateFieldValue` - Type-specific validation for different field types
3. `validateFieldHighlights` - Ensures fields with values have highlights
4. `validateKnowledgeUnit` - Complete validation of an entire Knowledge Unit

## Pre-Export Validation

The `ValidationExport` component:
1. Validates all KUs in the document before export
2. Shows a detailed summary of validation errors
3. Only enables export when all validation passes

## Integration Steps

To implement validation in your app:

1. Set up react-hook-form with appropriate validation modes
2. Define validation rules for each field type
3. Add visual error indicators
4. Implement custom field validation logic
5. Create utility functions for complex validation scenarios
6. Add pre-export validation checks

## Best Practices

- Use `mode: 'onChange'` for immediate feedback
- Provide clear, specific error messages
- Validate at multiple levels (field, KU, document)
- Use visual indicators to show validation state
- Prevent export/submission until validation passes



---------------------------










