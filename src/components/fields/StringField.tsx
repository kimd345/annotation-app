import { Control, Controller, useFormContext } from 'react-hook-form';
import { TextField } from '@mui/material';
import useAnnotationStore from '@/store/use-annotation-store';

interface StringFieldProps {
  index: number;
  control: Control<any>;
  field: {
    id: string;
    name: string;
    required?: boolean;
  };
  kuId: string;
  required: boolean;
  setHoveredField: (id: string | null) => void;
  triggerHighlightValidation: () => void;
  validationRules: Record<string, unknown>;
}

export const StringField = ({
  index,
  control,
  field,
  kuId,
  required,
  setHoveredField,
  triggerHighlightValidation,
  validationRules,
}: StringFieldProps) => {
  const { register } = useFormContext();
  const { id, name } = field;
  const updateFieldValue = useAnnotationStore((state) => state.updateFieldValue);

  return (
    <Controller
      name={`fields.${index}.value`}
      control={control}
      defaultValue=""
      rules={validationRules}
      render={({ field: renderField, fieldState }) => (
        <TextField
          {...renderField}
          fullWidth
          size="small"
          label={name}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          onChange={(e) => {
            renderField.onChange(e);
            updateFieldValue(kuId, id, e.target.value);
            // Register highlights for validation
            register(`fields.${index}.highlights`);
            triggerHighlightValidation();
          }}
          onMouseEnter={() => setHoveredField(id)}
          onMouseLeave={() => setHoveredField(null)}
          required={required}
        />
      )}
    />
  );
};

export default StringField;