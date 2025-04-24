// src/features/annotations/custom-field-modal.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { CustomFieldType } from '@/types';

// Define types for the form data
interface CustomFieldFormData {
  [key: string]: string | number | boolean | null;
}

const CustomFieldModal = () => {
  const {
    isCustomFieldModalOpen,
    activeCustomField,
    customFieldTypes,
    closeCustomFieldModal,
    updateFieldValue,
    knowledgeUnits,
    knowledgeUnitSchemas,
  } = useAnnotationStore(
    useShallow((state) => ({
      isCustomFieldModalOpen: state.isCustomFieldModalOpen,
      activeCustomField: state.activeCustomField,
      customFieldTypes: state.customFieldTypes,
      closeCustomFieldModal: state.closeCustomFieldModal,
      updateFieldValue: state.updateFieldValue,
      knowledgeUnits: state.knowledgeUnits,
      knowledgeUnitSchemas: state.knowledgeUnitSchemas,
    }))
  );

  // Use the correct type for currentFields based on CustomFieldType
  const [currentFields, setCurrentFields] = useState<CustomFieldType['fields']>(
    []
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // Create form methods with validation
  const methods = useForm<CustomFieldFormData>({
    mode: 'onChange',
    defaultValues: {},
  });

  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    formState: { errors, isValid, isDirty } 
  } = methods;

  // Find the current custom field type
  const customFieldType = activeCustomField?.fieldType
    ? customFieldTypes.find(
        (type) => type.typeId === activeCustomField.fieldType
      )
    : null;

  // Find the current field value if exists
  useEffect(() => {
    if (activeCustomField?.kuId && activeCustomField?.fieldId) {
      const ku = knowledgeUnits.find((ku) => ku.id === activeCustomField.kuId);
      if (ku) {
        const field = ku.fields.find((f) => f.id === activeCustomField.fieldId);
        if (field && field.value) {
          // Set default values for the form
          const values = field.value as Record<string, string | number>;
          Object.keys(values).forEach((key) => {
            setValue(key, values[key]);
          });
        }
      }
    }
  }, [activeCustomField, knowledgeUnits, setValue]);

  // When custom field type changes, update the fields
  useEffect(() => {
    if (customFieldType) {
      setCurrentFields(customFieldType.fields);
    } else {
      setCurrentFields([]);
    }
  }, [customFieldType]);

  // Handle form submission with proper typing and validation
  const onSubmit = (data: CustomFieldFormData) => {
    if (!activeCustomField) return;

    // Validate that at least one field has a value
    const hasValue = Object.values(data).some(
      (value) => value !== null && value !== undefined && value !== ''
    );

    if (!hasValue) {
      setValidationError('At least one field must have a value');
      return;
    }

    setValidationError(null);
    const { kuId, fieldId } = activeCustomField;
    // Since isNewField is optional in ActiveCustomField type, use a default of false
    const isNewField = activeCustomField.isNewField ?? false;

    if (isNewField) {
      // If this is a new field, we need to add it to the KU
      const ku = knowledgeUnits.find((ku) => ku.id === kuId);
      if (!ku) return;

      const schema = knowledgeUnitSchemas.find(
        (s) => s.frameId === ku.schemaId
      );
      if (!schema) return;

      const fieldSchema = schema.fields.find((f) => f.id === fieldId);
      if (!fieldSchema) return;

      // Add the field with the custom value
      const updatedKnowledgeUnits = knowledgeUnits.map((ku) =>
        ku.id === kuId
          ? {
              ...ku,
              fields: [
                ...ku.fields,
                { ...fieldSchema, highlights: [], value: data },
              ],
            }
          : ku
      );

      // Update the store
      useAnnotationStore.setState({ knowledgeUnits: updatedKnowledgeUnits });
    } else {
      // For existing fields, just update the value
      updateFieldValue(kuId, fieldId, data);
    }

    closeCustomFieldModal();
  };

  // Handle cancel
  const handleCancel = () => {
    reset();
    setValidationError(null);
    closeCustomFieldModal();
  };

  return (
    <Dialog
      open={isCustomFieldModalOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {customFieldType ? customFieldType.typeLabel : 'Custom Field'}
      </DialogTitle>
      <DialogContent>
        {!customFieldType ? (
          <Typography color="error">Custom field type not found</Typography>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {validationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationError}
                </Alert>
              )}
              
              <Box sx={{ mt: 2 }}>
                {currentFields.map((field) => (
                  <Box key={field.id} sx={{ mb: 2 }}>
                    {/* Render field based on its type */}
                    {field.type === 'integer' ? (
                      <Controller
                        name={field.id}
                        control={control}
                        defaultValue=""
                        rules={{
                          pattern: {
                            value: /^-?\d*$/,
                            message: 'Please enter a valid integer',
                          },
                        }}
                        render={({ field: renderField, fieldState }) => (
                          <TextField
                            {...renderField}
                            fullWidth
                            size="small"
                            label={field.name}
                            type="number"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            required={field.required}
                          />
                        )}
                      />
                    ) : field.type === 'DYNAMIC_PEOPLE' || field.type === 'LIST_PERSON' || field.type === 'LIST_COMPANY' ? (
                      // Special handling for dynamic lists and list types
                      <Controller
                        name={field.id}
                        control={control}
                        defaultValue=""
                        render={({ field: renderField, fieldState }) => (
                          <TextField
                            {...renderField}
                            fullWidth
                            size="small"
                            label={field.name}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            required={field.required}
                          />
                        )}
                      />
                    ) : Array.isArray(field.type) ? (
                      <Controller
                        name={field.id}
                        control={control}
                        defaultValue=""
                        rules={{
                          required: field.required
                            ? `${field.name} is required`
                            : false,
                        }}
                        render={({ field: renderField, fieldState }) => (
                          <FormControl
                            fullWidth
                            size="small"
                            error={!!fieldState.error}
                          >
                            <Select
                              {...renderField}
                              displayEmpty
                              renderValue={(selected) => {
                                return selected ? (
                                  (selected as React.ReactNode)
                                ) : (
                                  <Typography color="text.secondary">
                                    {field.name}
                                  </Typography>
                                );
                              }}
                            >
                              {Array.isArray(field.type) &&
                                field.type.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                            </Select>
                            {fieldState.error && (
                              <FormHelperText>
                                {fieldState.error.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    ) : (
                      <Controller
                        name={field.id}
                        control={control}
                        defaultValue=""
                        rules={{
                          required: field.required
                            ? `${field.name} is required`
                            : false,
                        }}
                        render={({ field: renderField, fieldState }) => (
                          <TextField
                            {...renderField}
                            fullWidth
                            size="small"
                            label={field.name}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            required={field.required}
                          />
                        )}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </form>
          </FormProvider>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomFieldModal;
