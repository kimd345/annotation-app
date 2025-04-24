import { Control, Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import useAnnotationStore from '@/store/use-annotation-store';
import { dynamicLists } from '@/lib/mock-data';

interface AutocompleteFieldProps {
  index: number;
  control: Control<any>;
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

export const AutocompleteField = ({
  index,
  control,
  field,
  kuId,
  multiple,
  required,
  setHoveredField,
  triggerHighlightValidation,
  validationRules,
}: AutocompleteFieldProps) => {
  const { id, name, type } = field;
  const updateFieldValue = useAnnotationStore((state) => state.updateFieldValue);
  
  // Get all possible options from dynamic lists
  let options: string[] = [];

  type.forEach((t) => {
    if (t.startsWith('DYNAMIC_')) {
      const listName = t as keyof typeof dynamicLists;
      if (dynamicLists[listName]) {
        options = [...options, ...dynamicLists[listName]];
      }
    } else if (t === 'LIST_PERSON') {
      // Map LIST_PERSON to DYNAMIC_PEOPLE
      options = [...options, ...dynamicLists['DYNAMIC_PEOPLE']];
    } else if (t === 'LIST_COMPANY') {
      // Map LIST_COMPANY to DYNAMIC_ORG
      options = [...options, ...dynamicLists['DYNAMIC_ORG']];
    } else if (
      typeof t === 'string' &&
      !t.startsWith('DYNAMIC_') &&
      !t.startsWith('LIST_')
    ) {
      options.push(t);
    }
  });

  return (
    <Controller
      name={`fields.${index}.value`}
      control={control}
      defaultValue={multiple ? [] : null}
      rules={validationRules}
      render={({
        field: { onChange, value, ...restField },
        fieldState,
      }) => (
        <Autocomplete
          {...restField}
          multiple={multiple}
          options={options}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              label={name}
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required={required}
            />
          )}
          value={value || (multiple ? [] : null)}
          onChange={(_, newValue) => {
            // Handle empty strings for single select
            const formattedValue = multiple ? newValue : (newValue || '');
            onChange(formattedValue);
            updateFieldValue(kuId, id, formattedValue);
            triggerHighlightValidation();
          }}
          filterOptions={(options, { inputValue }) => {
            const filtered = options.filter((option) =>
              option.toLowerCase().includes(inputValue.toLowerCase())
            );
            return filtered;
          }}
          onMouseEnter={() => setHoveredField(id)}
          onMouseLeave={() => setHoveredField(null)}
        />
      )}
    />
  );
};

export default AutocompleteField;