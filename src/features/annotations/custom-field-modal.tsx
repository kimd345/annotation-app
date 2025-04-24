// src/features/annotations/custom-field-modal.tsx
import React, { useEffect } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Alert,
	CircularProgress,
} from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { useCustomField } from '@/hooks/use-custom-field';
import CustomFieldInput from '@/components/fields/CustomFieldInput';
import { useCustomFieldTypesQuery } from '@/hooks/use-api';

const CustomFieldModal = () => {
	const {
		methods,
		currentFields,
		validationError,
		activeCustomField,
		isCustomFieldModalOpen,
		setCustomFieldType,
		handleSubmit,
		onSubmit,
		handleCancel,
	} = useCustomField();

	// Fetch custom field types
	const {
		data: customFieldTypes,
		isLoading,
		isError,
	} = useCustomFieldTypesQuery();

	// Find the current custom field type
	const customFieldType =
		activeCustomField?.fieldType && customFieldTypes
			? customFieldTypes.find(
					(type) => type.typeId === activeCustomField.fieldType
			  )
			: null;

	// Update the custom field type when it changes
	useEffect(() => {
		if (customFieldType) {
			setCustomFieldType(customFieldType);
		}
	}, [customFieldType, setCustomFieldType]);

	return (
		<Dialog
			open={isCustomFieldModalOpen}
			onClose={handleCancel}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>
				{isLoading
					? 'Loading...'
					: isError
					? 'Error Loading Field Types'
					: customFieldType
					? customFieldType.typeLabel
					: 'Custom Field'}
			</DialogTitle>
			<DialogContent>
				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
						<CircularProgress />
					</Box>
				) : isError ? (
					<Typography color='error'>
						Error loading custom field types
					</Typography>
				) : !customFieldType ? (
					<Typography color='error'>Custom field type not found</Typography>
				) : (
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							{validationError && (
								<Alert severity='error' sx={{ mb: 2 }}>
									{validationError}
								</Alert>
							)}

							<Box sx={{ mt: 2 }}>
								{currentFields.map((field) => (
									<Box key={field.id} sx={{ mb: 2 }}>
										<CustomFieldInput field={field} control={methods.control} />
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
					variant='contained'
					color='primary'
					disabled={isLoading || isError}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CustomFieldModal;
