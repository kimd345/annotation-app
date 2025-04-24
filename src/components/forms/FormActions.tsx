import React from 'react';
import { Box, Button, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface FormActionsProps {
  onValidate: () => void;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
}

const FormActions = ({
  onValidate,
  isSubmitting,
  isSubmitSuccessful,
}: FormActionsProps) => {
  return (
    <>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
      >
        <Button
          onClick={onValidate}
          color="secondary"
          variant="contained"
        >
          Validate
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
        >
          Save Knowledge Unit
        </Button>
      </Box>

      {isSubmitSuccessful && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Knowledge unit saved successfully!
        </Alert>
      )}
    </>
  );
};

export default FormActions;