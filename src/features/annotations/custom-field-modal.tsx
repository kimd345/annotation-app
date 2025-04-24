// src/features/annotations/custom-field-modal.tsx
import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
} from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { useCustomField } from '@/hooks/use-custom-field';
import CustomFieldInput from '@/components/fields/CustomFieldInput';

const CustomFieldModal = () => {
  const {
    methods,
    currentFields,
    validationError,
    customFieldType,
    isCustomFieldModalOpen,
    handleSubmit,
    onSubmit,
    handleCancel,
  } = useCustomField();

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
                    <CustomFieldInput 
                      field={field}
                      control={methods.control}
                    />
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
};

export default CustomFieldModal;