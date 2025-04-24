import { Control, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import useAnnotationStore from '@/store/use-annotation-store';

interface IntegerFieldProps {
  index: number;
  control: Control;
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

export const IntegerField = ({
  index,
  control,
  field,
  kuId,
  required,
  setHoveredField,
  triggerHighlightValidation,
  validationRules,
}: IntegerFieldProps) => {
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
          type="number"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          onChange={(e) => {
            renderField.onChange(e);
            const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
            updateFieldValue(kuId, id, value);
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

export default IntegerField;