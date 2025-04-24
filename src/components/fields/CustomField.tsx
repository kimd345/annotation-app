import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Control, Controller } from 'react-hook-form';
import useAnnotationStore from '@/store/use-annotation-store';

interface CustomFieldProps {
  index: number;
  control: Control<any>;
  field: {
    id: string;
    name: string;
    type: string;
    required?: boolean;
  };
  kuId: string;
  required: boolean;
  setHoveredField: (id: string | null) => void;
  validationRules: Record<string, unknown>;
}

export const CustomField = ({
  index,
  control,
  field,
  kuId,
  required,
  setHoveredField,
  validationRules,
}: CustomFieldProps) => {
  const { id, name, type } = field;

  return (
    <Controller
      name={`fields.${index}.value`}
      control={control}
      defaultValue=""
      rules={validationRules}
      render={({ field: renderField, fieldState }) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            {...renderField}
            fullWidth
            size="small"
            label={name}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            disabled={true}
            value={
              renderField.value
                ? typeof renderField.value === 'object'
                  ? JSON.stringify(renderField.value).substring(0, 20) + '...'
                  : renderField.value
                : ''
            }
            onMouseEnter={() => setHoveredField(id)}
            onMouseLeave={() => setHoveredField(null)}
            required={required}
          />
          <IconButton
            onClick={() => {
              // Open custom field modal
              const openCustomFieldModal = useAnnotationStore.getState().openCustomFieldModal;
              openCustomFieldModal(kuId, id, type);
            }}
          >
            <Tooltip title="View or edit custom field">
              <EditIcon />
            </Tooltip>
          </IconButton>
        </Box>
      )}
    />
  );
};

export default CustomField;