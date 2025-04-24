import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAnnotationStore from '@/store/use-annotation-store';

interface OptionalFieldsMenuProps {
  availableOptionalFields: Array<{ id: string; name: string }>;
  kuId: string;
}

const OptionalFieldsMenu = ({
  availableOptionalFields,
  kuId,
}: OptionalFieldsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle adding an optional field
  const handleAddField = (fieldId: string) => {
    const addFieldToKU = useAnnotationStore.getState().addFieldToKU;
    addFieldToKU(kuId, fieldId);
    handleCloseMenu();
  };

  // Handle opening/closing menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  if (availableOptionalFields.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, display: 'flex' }}>
      <Button
        startIcon={<AddIcon />}
        size="small"
        onClick={handleOpenMenu}
        variant="outlined"
      >
        Add Field
      </Button>

      {/* Optional fields dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {availableOptionalFields.map((field) => (
          <MenuItem
            key={field.id}
            onClick={() => handleAddField(field.id)}
          >
            {field.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default OptionalFieldsMenu;