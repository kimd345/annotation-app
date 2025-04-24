import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ValidationSummary {
  showValidationSummary: boolean;
  setShowValidationSummary: (show: boolean) => void;
  validateForm: () => void;
}

export interface FormData {
  fields: {
    id: string;
    value: unknown;
    highlights: unknown[];
  }[];
}

export const useFormValidation = <T extends FormData>(
  initialValues: T
): [ReturnType<typeof useForm<T>>, ValidationSummary] => {
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Setup form with validation
  const methods = useForm<T>({
    mode: 'onChange',
    defaultValues: initialValues,
  });

  const { trigger } = methods;

  // Validate all fields
  const validateForm = () => {
    trigger();
    setShowValidationSummary(true);
  };

  return [
    methods,
    {
      showValidationSummary,
      setShowValidationSummary,
      validateForm,
    },
  ];
};