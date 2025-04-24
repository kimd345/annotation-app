import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	Box,
	Button,
	Card,
	CardContent,
	Menu,
	MenuItem,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import FieldInput from './field-input';

// Main KU Form component
const KnowledgeUnitForm = ({
	kuId,
	schemaId,
}: {
	kuId: string;
	schemaId: string;
}) => {
	const { knowledgeUnits, knowledgeUnitSchemas, setActiveHighlightField } =
		useAnnotationStore(
			useShallow((state) => ({
				knowledgeUnits: state.knowledgeUnits,
				knowledgeUnitSchemas: state.knowledgeUnitSchemas,
				setActiveHighlightField: state.setActiveHighlightField,
			}))
		);

	// Find the KU and its schema
	const ku = knowledgeUnits.find((ku) => ku.id === kuId);
	const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);

	// Setup form
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<{ fields: { id: string; value: unknown }[] }>({
		defaultValues: {
			fields: ku?.fields,
		},
	});

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	// If KU or schema not found, return error
	if (!ku || !schema) {
		return <Typography color='error'>Knowledge Unit not found</Typography>;
	}

	// Get optional fields not yet added
	const availableOptionalFields = schema.fields.filter(
		(schemaField) =>
			!schemaField.required &&
			!ku.fields.some((field) => field.id === schemaField.id)
	);

	// Handle adding an optional field
	const handleAddField = (fieldId: string) => {
		const addFieldToKU = useAnnotationStore.getState().addFieldToKU;
		addFieldToKU(kuId, fieldId);
		console.log('After addFieldToKU:', useAnnotationStore.getState());
		handleCloseMenu();
	};

	// Handle opening KU type menu
	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget);

	// Handle closing KU type menu
	const handleCloseMenu = () => setAnchorEl(null);

	// Handle form submission
	const onSubmit = (data: unknown) => {
		console.log('Form submitted:', data);
	};

	return (
		<Card variant='outlined' sx={{ mb: 3 }}>
			<CardContent>
				<Typography variant='h6' gutterBottom>
					{schema.frameLabel}
				</Typography>

				<form onSubmit={handleSubmit(onSubmit)}>
					{/* Render existing fields */}
					{ku.fields.map((field, index) => (
						<Box key={field.id} data-field-id={field.id}>
							<FieldInput
								field={field}
								index={index}
								// @ts-expect-error TODO: Fix type error
								control={control}
								errors={errors}
								kuId={kuId}
								setActiveHighlightField={setActiveHighlightField}
							/>
						</Box>
					))}

					{/* Add optional field button */}
					{availableOptionalFields.length > 0 && (
						<Box sx={{ mb: 2, display: 'flex' }}>
							<Button
								startIcon={<AddIcon />}
								size='small'
								onClick={(e) => handleOpenMenu(e)}
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
									<MenuItem
										key={field.id}
										onClick={() => handleAddField(field.id)}
									>
										{field.name}
									</MenuItem>
								))}
							</Menu>
						</Box>
					)}
				</form>
			</CardContent>
		</Card>
	);
};

export default KnowledgeUnitForm;
