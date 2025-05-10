import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAnnotationStore from '@/store/use-annotation-store';
import {
	useKnowledgeUnitMutation,
	useDocumentAnnotationsQuery,
} from '@/hooks/use-api';

interface OptionalFieldsMenuProps {
	availableOptionalFields: Array<{ id: string; name: string }>;
	kuId: string;
}

const OptionalFieldsMenu = ({
	availableOptionalFields,
	kuId,
}: OptionalFieldsMenuProps) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	// Use the mutation for updating KUs
	const kuMutation = useKnowledgeUnitMutation();

	// Get the annotation store
	const addFieldToKU = useAnnotationStore((state) => state.addFieldToKU);
	const knowledgeUnits = useAnnotationStore((state) => state.knowledgeUnits);

	// Get the current KU
	const ku = knowledgeUnits.find((ku) => ku.id === kuId);

	// Handle adding an optional field
	const handleAddField = (fieldId: string) => {
		// First, add the field to the local state
		addFieldToKU(kuId, fieldId);

		// Then close the menu
		handleCloseMenu();

		// Get the updated KU after state update
		// Need setTimeout because the state update is async
		setTimeout(() => {
			const updatedKU = useAnnotationStore
				.getState()
				.knowledgeUnits.find((ku) => ku.id === kuId);

			// If we got the updated KU, save it to the backend
			if (updatedKU) {
				kuMutation.mutate(updatedKU);
			}
		}, 0);
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
				size='small'
				onClick={handleOpenMenu}
				variant='outlined'
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
					<MenuItem key={field.id} onClick={() => handleAddField(field.id)}>
						{field.name}
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
};

export default OptionalFieldsMenu;