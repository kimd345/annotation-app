import React from 'react';
import { Alert } from '@mui/material';
import { FieldErrors } from 'react-hook-form';
import { FormData } from '@/hooks/use-form-validation';

interface ValidationSummaryProps {
  showValidationSummary: boolean;
  errors: FieldErrors<FormData>;
  fields: Array<{ id: string }>;
  schemaFields: Array<{ id: string; name: string }>;
}

const ValidationSummary = ({
  showValidationSummary,
  errors,
  fields,
  schemaFields,
}: ValidationSummaryProps) => {
  if (!showValidationSummary || Object.keys(errors).length === 0) {
    return null;
  }

  interface FieldError {
    value?: { message?: string };
    highlights?: { message?: string };
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      Please fix the following errors:
      <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
        {Object.entries(errors.fields || {}).map(
          ([index, fieldErrors]) => {
            const idx = Number(index);
            const fieldId = fields[idx]?.id;
            const fieldName =
              schemaFields.find((f) => f.id === fieldId)?.name ||
              fieldId;
              
            const typedErrors = fieldErrors as unknown as FieldError;
            
            return (
              <li key={index}>
                {fieldName}:{' '}
                {typedErrors?.value?.message ||
                  typedErrors?.highlights?.message ||
                  'Invalid value'}
              </li>
            );
          }
        )}
      </ul>
    </Alert>
  );
};

export default ValidationSummary;