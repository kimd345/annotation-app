// src/features/annotations/ku-form.tsx
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
	Box,
	Button,
	Card,
	CardContent,
	Menu,
	MenuItem,
	Typography,
	Alert,
	Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import FieldInput from './field-input';

// Form data type
interface FormData {
	fields: {
		id: string;
		value: unknown;
		highlights: unknown[];
	}[];
}

// Main KU Form component
const KnowledgeUnitForm = ({
	kuId,
	schemaId,
}: {
	kuId: string;
	schemaId: string;
}) => {
	const {
		knowledgeUnits,
		knowledgeUnitSchemas,
		setActiveHighlightField,
		updateFieldValue,
	} = useAnnotationStore(
		useShallow((state) => ({
			knowledgeUnits: state.knowledgeUnits,
			knowledgeUnitSchemas: state.knowledgeUnitSchemas,
			setActiveHighlightField: state.setActiveHighlightField,
			updateFieldValue: state.updateFieldValue,
		}))
	);

	// Find the KU and its schema
	const ku = knowledgeUnits.find((ku) => ku.id === kuId);
	const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);

	// State for menu
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showValidationSummary, setShowValidationSummary] = useState(false);

	// Setup form with validation
	const methods = useForm<FormData>({
		mode: 'onChange',
		defaultValues: {
			fields:
				ku?.fields.map((field) => ({
					id: field.id,
					value: field.value || '',
					highlights: field.highlights || [],
				})) || [],
		},
	});

	const {
		handleSubmit,
		formState: { errors, isDirty, isValid, isSubmitting, isSubmitSuccessful },
		reset,
		trigger,
		getValues,
		setValue,
		watch,
	} = methods;

	// Re-initialize form when KU changes
	useEffect(() => {
		if (ku) {
			reset({
				fields: ku.fields.map((field) => {
					// Handle initialization for multiple select fields
					if (field.multiple && field.value === undefined) {
						return {
							id: field.id,
							value: [],
							highlights: field.highlights || [],
						};
					}

					return {
						id: field.id,
						value: field.value ?? '',
						highlights: field.highlights || [],
					};
				}),
			});
		}
	}, [ku?.id, reset, ku]);

	// Watch all fields for validation
	const watchedFields = watch();

	// If KU or schema not found, return error
	if (!ku || !schema) {
		return <Typography color='error'>Knowledge Unit not found</Typography>;
	}

	// Custom validation function for highlights
	const validateHighlights = (
		highlights: any[],
		fieldId: string,
		required: boolean
	) => {
		try {
			// Get the field index safely
			const fieldIndex = ku.fields.findIndex((f) => f.id === fieldId);
			if (fieldIndex === -1) return true; // Field not found, skip validation

			// Get field value safely
			const fieldValue = getValues(`fields.${fieldIndex}.value`);

			// Check if value is empty
			const isEmpty =
				fieldValue === '' ||
				fieldValue === null ||
				fieldValue === undefined ||
				(Array.isArray(fieldValue) && fieldValue.length === 0);

			// Skip validation for optional fields with no value
			if (!required && isEmpty) {
				return true;
			}

			// All fields with values should have highlights
			return (
				(highlights && highlights.length > 0) ||
				'Evidence highlighting required'
			);
		} catch (error) {
			console.error('Highlight validation error:', error);
			return true; // Skip validation on error to prevent crashes
		}
	};

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
		handleCloseMenu();
	};

	// Handle opening/closing menu
	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget);
	const handleCloseMenu = () => setAnchorEl(null);

	// Handle form submission with validation
	const onSubmit = (data: FormData) => {
		console.log('Form submitted successfully:', data);

		// Update all field values in the store
		data.fields.forEach((field, index) => {
			const kuField = ku.fields[index];
			if (kuField) {
				updateFieldValue(kuId, kuField.id, field.value);
			}
		});

		// Show success message or perform other actions
		setShowValidationSummary(false);
	};

	const onError = (errors: any) => {
		console.error('Form validation errors:', errors);
		setShowValidationSummary(true);
	};

	// Validate all fields
	const validateForm = () => {
		trigger();
		setShowValidationSummary(true);
	};

	return (
		<FormProvider {...methods}>
			<Card variant='outlined' sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant='h6' gutterBottom>
						{schema.frameLabel}
					</Typography>

					<form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
						{/* Show validation summary if needed */}
						{showValidationSummary && Object.keys(errors).length > 0 && (
							<Alert severity='error' sx={{ mb: 2 }}>
								Please fix the following errors:
								<ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
									{Object.entries(errors.fields || {}).map(
										([index, fieldErrors]: [string, any]) => {
											const fieldId = ku.fields[parseInt(index)]?.id;
											const fieldName =
												schema.fields.find((f) => f.id === fieldId)?.name ||
												fieldId;
											return (
												<li key={index}>
													{fieldName}:{' '}
													{fieldErrors?.value?.message ||
														fieldErrors?.highlights?.message ||
														'Invalid value'}
												</li>
											);
										}
									)}
								</ul>
							</Alert>
						)}

						{/* Render existing fields */}
						{ku.fields.map((field, index) => {
							// Find schema field to get validation rules
							const schemaField = schema.fields.find((f) => f.id === field.id);

							return (
								<Box key={field.id} data-field-id={field.id}>
									<FieldInput
										field={field}
										index={index}
										control={methods.control}
										errors={errors}
										kuId={kuId}
										setActiveHighlightField={setActiveHighlightField}
										validateHighlights={validateHighlights}
										required={schemaField?.required || false}
									/>
								</Box>
							);
						})}

						{/* Add optional field button */}
						{availableOptionalFields.length > 0 && (
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

						<Divider sx={{ my: 2 }} />

						{/* Form actions */}
						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
						>
							<Button
								onClick={validateForm}
								color='secondary'
								variant='contained'
							>
								Validate
							</Button>

							<Button
								type='submit'
								variant='contained'
								color='primary'
								disabled={isSubmitting}
								startIcon={<SaveIcon />}
							>
								Save Knowledge Unit
							</Button>
						</Box>

						{isSubmitSuccessful && (
							<Alert severity='success' sx={{ mt: 2 }}>
								Knowledge unit saved successfully!
							</Alert>
						)}
					</form>
				</CardContent>
			</Card>
		</FormProvider>
	);
};

export default KnowledgeUnitForm;
