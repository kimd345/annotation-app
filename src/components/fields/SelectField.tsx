import { Control, Controller } from 'react-hook-form';
import { Box, Chip, FormControl, FormHelperText, MenuItem, Select, Typography } from '@mui/material';
import useAnnotationStore from '@/store/use-annotation-store';

interface SelectFieldProps {
  index: number;
  control: Control;
  field: {
    id: string;
    name: string;
    type: string[];
    multiple?: boolean;
    required?: boolean;
  };
  kuId: string;
  multiple: boolean;
  required: boolean;
  setHoveredField: (id: string | null) => void;
  triggerHighlightValidation: () => void;
  validationRules: Record<string, unknown>;
}

export const SelectField = ({
  index,
  control,
  field,
  kuId,
  multiple,
  required,
  setHoveredField,
  triggerHighlightValidation,
  validationRules,
}: SelectFieldProps) => {
  const { id, name, type } = field;
  const updateFieldValue = useAnnotationStore((state) => state.updateFieldValue);

  return (
    <Controller
      name={`fields.${index}.value`}
      control={control}
      defaultValue={multiple ? [] : ''}
      rules={validationRules}
      render={({ field: renderField, fieldState }) => (
        <FormControl
          fullWidth
          size="small"
          error={!!fieldState.error}
          required={required}
          onMouseEnter={() => setHoveredField(id)}
          onMouseLeave={() => setHoveredField(null)}
        >
          <Select
            {...renderField}
            multiple={multiple}
            displayEmpty
            renderValue={(selected) => {
              if (multiple) {
                // Ensure selected is always an array
                const selectedArray = Array.isArray(selected)
                  ? selected
                  : selected
                  ? [selected]
                  : [];
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedArray.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                );
              }
              return selected ? (
                selected
              ) : (
                <Typography color="text.secondary">{name}</Typography>
              );
            }}
            onChange={(e) => {
              renderField.onChange(e);
              updateFieldValue(kuId, id, e.target.value);
              triggerHighlightValidation();
            }}
          >
            {type.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && (
            <FormHelperText>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default SelectField;