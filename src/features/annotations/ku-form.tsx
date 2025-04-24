// src/features/annotations/ku-form.tsx
import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { useFormValidation, FormData } from '@/hooks/use-form-validation';
import FieldInput from './field-input';
import ValidationSummary from '@/components/forms/ValidationSummary';
import OptionalFieldsMenu from '@/components/forms/OptionalFieldsMenu';
import FormActions from '@/components/forms/FormActions';

// Main KU Form component
const KnowledgeUnitForm = ({
  kuId,
  schemaId,
}: {
  kuId: string;
  schemaId: string;
}) => {
  const {
    knowledgeUnits,
    knowledgeUnitSchemas,
    setActiveHighlightField,
    updateFieldValue,
  } = useAnnotationStore(
    useShallow((state) => ({
      knowledgeUnits: state.knowledgeUnits,
      knowledgeUnitSchemas: state.knowledgeUnitSchemas,
      setActiveHighlightField: state.setActiveHighlightField,
      updateFieldValue: state.updateFieldValue,
    }))
  );

  // Find the KU and its schema
  const ku = knowledgeUnits.find((ku) => ku.id === kuId);
  const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);

  // Setup form with validation
  const [methods, validationState] = useFormValidation<FormData>({
    fields:
      ku?.fields.map((field) => ({
        id: field.id,
        value: field.value || '',
        highlights: field.highlights || [],
      })) || [],
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
    getValues,
  } = methods;

  const { showValidationSummary, setShowValidationSummary, validateForm } = validationState;

  // Re-initialize form when KU changes
  useEffect(() => {
    if (ku) {
      reset({
        fields: ku.fields.map((field) => {
          // Handle initialization for multiple select fields
          if (field.multiple && field.value === undefined) {
            return {
              id: field.id,
              value: [],
              highlights: field.highlights || [],
            };
          }

          return {
            id: field.id,
            value: field.value ?? '',
            highlights: field.highlights || [],
          };
        }),
      });
    }
  }, [ku?.id, reset, ku]);

  // If KU or schema not found, return error
  if (!ku || !schema) {
    return <Typography color="error">Knowledge Unit not found</Typography>;
  }

  // Custom validation function for highlights
  const validateHighlights = (
    highlights: Array<{ id: string }>,
    fieldId: string,
    required: boolean
  ): boolean | string => {
    try {
      // Get the field index safely
      const fieldIndex = ku.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return true; // Field not found, skip validation

      // Get field value safely
      const fieldValue = getValues(`fields.${fieldIndex}.value`);

      // Check if value is empty
      const isEmpty =
        fieldValue === '' ||
        fieldValue === null ||
        fieldValue === undefined ||
        (Array.isArray(fieldValue) && fieldValue.length === 0);

      // Skip validation for optional fields with no value
      if (!required && isEmpty) {
        return true;
      }

      // All fields with values should have highlights
      return (
        (highlights && highlights.length > 0) ||
        'Evidence highlighting required'
      );
    } catch (error) {
      console.error('Highlight validation error:', error);
      return true; // Skip validation on error to prevent crashes
    }
  };

  // Get optional fields not yet added
  const availableOptionalFields = schema.fields.filter(
    (schemaField) =>
      !schemaField.required &&
      !ku.fields.some((field) => field.id === schemaField.id)
  );

  // Handle form submission with validation
  const onSubmit = (data: FormData) => {
    console.log('Form submitted successfully:', data);

    // Update all field values in the store
    data.fields.forEach((field, index) => {
      const kuField = ku.fields[index];
      if (kuField) {
        updateFieldValue(kuId, kuField.id, field.value);
      }
    });

    // Hide validation summary on success
    setShowValidationSummary(false);
  };

  const onError = () => {
    console.error('Form validation errors:', errors);
    setShowValidationSummary(true);
  };

  return (
    <FormProvider {...methods}>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {schema.frameLabel}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            {/* Validation Summary Component */}
            <ValidationSummary 
              showValidationSummary={showValidationSummary}
              errors={errors}
              fields={ku.fields}
              schemaFields={schema.fields}
            />

            {/* Render existing fields */}
            {ku.fields.map((field, index) => {
              // Find schema field to get validation rules
              const schemaField = schema.fields.find((f) => f.id === field.id);

              return (
                <Box key={field.id} data-field-id={field.id}>
                  <FieldInput
                    field={field}
                    index={index}
                    control={methods.control}
                    errors={errors}
                    kuId={kuId}
                    setActiveHighlightField={setActiveHighlightField}
                    validateHighlights={validateHighlights}
                    required={schemaField?.required || false}
                  />
                </Box>
              );
            })}

            {/* Optional Fields Menu Component */}
            <OptionalFieldsMenu 
              availableOptionalFields={availableOptionalFields}
              kuId={kuId}
            />

            <Divider sx={{ my: 2 }} />

            {/* Form Actions Component */}
            <FormActions 
              onValidate={validateForm}
              isSubmitting={isSubmitting}
              isSubmitSuccessful={isSubmitSuccessful}
            />
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default KnowledgeUnitForm;