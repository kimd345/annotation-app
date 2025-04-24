import React from 'react';
import { FormControl, FormHelperText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Controller, Control, FieldValues } from 'react-hook-form';

interface CustomFieldInputProps {
  field: {
    id: string;
    name: string;
    type: string | string[];
    required?: boolean;
  };
  control: Control<FieldValues>;
}

const CustomFieldInput = ({ field, control }: CustomFieldInputProps) => {
  // Render field based on its type
  if (field.type === 'integer') {
    return (
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
    );
  }
  
  if (field.type === 'DYNAMIC_PEOPLE' || field.type === 'LIST_PERSON' || field.type === 'LIST_COMPANY') {
    // Special handling for dynamic lists and list types
    return (
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
    );
  }
  
  if (Array.isArray(field.type)) {
    return (
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
    );
  }
  
  // Default to string field
  return (
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
  );
};

export default CustomFieldInput;