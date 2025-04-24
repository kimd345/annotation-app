import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { CustomFieldType } from '@/types';

// Define types for the form data
export interface CustomFieldFormData {
  [key: string]: string | number | boolean | null;
}

export const useCustomField = () => {
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
  const [currentFields, setCurrentFields] = useState<CustomFieldType['fields']>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create form methods with validation
  const methods = useForm<CustomFieldFormData>({
    mode: 'onChange',
    defaultValues: {},
  });

  const { handleSubmit, reset, setValue } = methods;

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

  return {
    methods,
    currentFields,
    validationError,
    customFieldType,
    isCustomFieldModalOpen,
    handleSubmit,
    onSubmit,
    handleCancel,
  };
};