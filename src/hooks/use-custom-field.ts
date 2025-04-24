import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { CustomFieldType } from '@/types';
import { useDocumentAnnotationsQuery, useKnowledgeUnitMutation } from '@/hooks/use-api';

// Define types for the form data
export interface CustomFieldFormData {
  [key: string]: string | number | boolean | null;
}

export const useCustomField = () => {
  const {
    isCustomFieldModalOpen,
    activeCustomField,
    closeCustomFieldModal,
  } = useAnnotationStore(
    useShallow((state) => ({
      isCustomFieldModalOpen: state.isCustomFieldModalOpen,
      activeCustomField: state.activeCustomField,
      closeCustomFieldModal: state.closeCustomFieldModal,
    }))
  );

  // Use the mutation for updating KUs
  const kuMutation = useKnowledgeUnitMutation();
  
  // Fetch the current KU's annotations to update them later
  const { data: annotations } = useDocumentAnnotationsQuery(
    activeCustomField ? 
      annotations => annotations.find(ku => ku.id === activeCustomField.kuId)?.documentId || null
      : null
  );

  // Track the custom field type and fields
  const [customFieldType, setCustomFieldType] = useState<CustomFieldType | null>(null);
  const [currentFields, setCurrentFields] = useState<CustomFieldType['fields']>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create form methods with validation
  const methods = useForm<CustomFieldFormData>({
    mode: 'onChange',
    defaultValues: {},
  });

  const { handleSubmit, reset, setValue } = methods;

  // Find the current field value if exists
  useEffect(() => {
    if (activeCustomField?.kuId && activeCustomField?.fieldId && annotations) {
      const ku = annotations.find((ku) => ku.id === activeCustomField.kuId);
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
  }, [activeCustomField, annotations, setValue]);

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
    if (!activeCustomField || !annotations) return;

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

    // Find the current KU
    const ku = annotations.find(ku => ku.id === kuId);
    if (!ku) {
      console.error('Knowledge unit not found');
      return;
    }

    let updatedKU = { ...ku };

    if (isNewField) {
      // Get the field schema from the KU schema
      const schemaFields = useAnnotationStore.getState().knowledgeUnitSchemas
        .find(s => s.frameId === ku.schemaId)?.fields;
      
      if (!schemaFields) {
        console.error('Schema not found');
        return;
      }

      const fieldSchema = schemaFields.find(f => f.id === fieldId);
      if (!fieldSchema) {
        console.error('Field schema not found');
        return;
      }

      // Add the new field to the KU
      updatedKU = {
        ...ku,
        fields: [
          ...ku.fields,
          {
            ...fieldSchema,
            value: data,
            highlights: [],
          }
        ]
      };
    } else {
      // Update the existing field
      updatedKU = {
        ...ku,
        fields: ku.fields.map(field => 
          field.id === fieldId 
            ? { ...field, value: data } 
            : field
        )
      };
    }

    // Save the updated KU to the API
    kuMutation.mutate(updatedKU, {
      onSuccess: () => {
        closeCustomFieldModal();
      }
    });
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
    activeCustomField,
    isCustomFieldModalOpen,
    setCustomFieldType,
    handleSubmit,
    onSubmit,
    handleCancel,
  };
}