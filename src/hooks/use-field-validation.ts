import { useFormContext } from 'react-hook-form';

export type ValidationRules = Record<string, unknown>;

export const useFieldValidation = (
  fieldId: string,
  fieldName: string,
  fieldType: string | string[],
  required: boolean,
  index: number,
  highlights: Array<{ id: string }>,
) => {
  const { register, trigger, getValues } = useFormContext();

  const getValidationRules = (): ValidationRules => {
    const rules: ValidationRules = {};

    // Required field validation with special handling for select fields
    if (required) {
      // For all field types, use a validate function instead of 'required'
      rules.validate = {
        ...(rules.validate as Record<string, unknown>),
        required: (value: unknown) => {
          if (Array.isArray(value)) {
            // For multiple select - check array length
            return value.length > 0 || `${fieldName} is required`;
          } else if (typeof value === 'string' && Array.isArray(fieldType)) {
            // For single select - check for non-empty string
            return !!value || `${fieldName} is required`;
          } else {
            // For other fields
            return (value !== undefined && value !== null && value !== '') || `${fieldName} is required`;
          }
        },
      };
    }

    // Type-specific validation
    if (fieldType === 'integer') {
      rules.pattern = {
        value: /^-?\d+$/,
        message: 'Please enter a valid integer',
      };

      // Convert to number on validation
      rules.setValueAs = (value: string) =>
        value === '' ? '' : parseInt(value, 10);
    }

    // Add highlight validation
    rules.validate = {
      ...(rules.validate as Record<string, unknown> || {}),
      highlights: () => validateHighlights(),
    };

    return rules;
  };

  const validateHighlights = (): boolean | string => {
    // Get the field value directly from the form
    const fieldValue = getValues(`fields.${index}.value`);
    
    // Skip validation for optional fields with no value
    const isEmpty = fieldValue === '' || 
                   fieldValue === null || 
                   fieldValue === undefined || 
                   (Array.isArray(fieldValue) && fieldValue.length === 0);
    
    if (!required && isEmpty) {
      return true;
    }
    
    // All fields with values should have highlights
    return highlights && highlights.length > 0 || 'Evidence highlighting required';
  };

  // Register highlights field for validation
  const registerHighlightValidation = (): void => {
    register(`fields.${index}.highlights`, {
      validate: validateHighlights,
    });
  };

  const triggerHighlightValidation = (): void => {
    trigger(`fields.${index}.highlights`);
  };

  return {
    getValidationRules,
    validateHighlights,
    registerHighlightValidation,
    triggerHighlightValidation,
  };
};