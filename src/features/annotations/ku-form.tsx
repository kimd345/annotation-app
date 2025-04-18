import React, { useState } from 'react';
import {
	useForm,
	Controller,
	Control,
	FieldErrors,
} from 'react-hook-form';
import {
	Box,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	Select,
	Menu,
	MenuItem,
	FormControl,
	FormHelperText,
	IconButton,
	Autocomplete,
	Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightIcon from '@mui/icons-material/Highlight';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { dynamicLists } from '@/lib/mock-data';
import { getColorForField } from '@/utils/format';

// Custom field types renderer
const FieldInput = ({
	field,
	control,
	errors,
	index,
	kuId,
	setActiveHighlightField,
}: {
	field: {
		type: string | string[];
		name: string;
		id: string;
		multiple?: boolean;
		required?: boolean;
	};
	control: Control;
	errors: FieldErrors<{ fields: { value: unknown }[] }>;
	index: number;
	kuId: string;
	setActiveHighlightField: (id: string | null) => void;
}) => {
	const { type, name, id, multiple, required } = field;

	// Get field value from store
	const {
		updateFieldValue,
		removeFieldFromKU,
		setHoveredField,
		knowledgeUnits,
		activeHighlightFieldId,
	} = useAnnotationStore(
		useShallow((state) => ({
			updateFieldValue: state.updateFieldValue,
			removeFieldFromKU: state.removeFieldFromKU,
			setHoveredField: state.setHoveredField,
			knowledgeUnits: state.knowledgeUnits,
			activeHighlightFieldId: state.activeHighlightFieldId,
		}))
	);

	// Function to get field highlights count
	const getFieldHighlights = () => {
		const ku = knowledgeUnits.find((ku) => ku.id === kuId);
		if (!ku) return [];

		const fieldData = ku.fields.find((f) => f.id === id);
		return fieldData?.highlights || [];
	};

	// Get the field's highlight state
	const fieldHighlights = getFieldHighlights();
	const hasHighlights = fieldHighlights.length > 0;
	const isActive = activeHighlightFieldId === id;

	// Get field color for highlights
	const getFieldColor = () => {
		// Import the color utility function
		return getColorForField(id);
	};

	// Function to handle field type rendering
	const renderFieldInput = () => {
		// Handle string type
		if (type === 'string') {
			return (
				<Controller
					name={`fields.${index}.value`}
					control={control}
					defaultValue=''
					rules={{ required: required ? `${name} is required` : false }}
					render={({ field: renderField }) => (
						<TextField
							{...renderField}
							fullWidth
							size='small'
							label={name}
							error={!!errors.fields?.[index]?.value?.message}
							helperText={errors.fields?.[index]?.value?.message}
							onChange={(e) => {
								renderField.onChange(e);
								updateFieldValue(kuId, id, e.target.value);
							}}
							onMouseEnter={() => setHoveredField(id)}
							onMouseLeave={() => setHoveredField(null)}
						/>
					)}
				/>
			);
		}

		// Handle integer type
		if (type === 'integer') {
			return (
				<Controller
					name={`fields.${index}.value`}
					control={control}
					defaultValue=''
					rules={{
						required: required ? `${name} is required` : false,
						pattern: {
							value: /^[0-9]*$/,
							message: 'Please enter a valid integer',
						},
					}}
					render={({ field: renderField }) => (
						<TextField
							{...renderField}
							fullWidth
							size='small'
							label={name}
							type='number'
							error={!!errors.fields?.[index]?.value}
							helperText={errors.fields?.[index]?.value?.message}
							onChange={(e) => {
								renderField.onChange(e);
								updateFieldValue(kuId, id, parseInt(e.target.value, 10));
							}}
							onMouseEnter={() => setHoveredField(id)}
							onMouseLeave={() => setHoveredField(null)}
						/>
					)}
				/>
			);
		}

		// Handle dropdown type (array of options)
		if (Array.isArray(type)) {
			// Check if it's a dynamic list
			const isDynamicList = type.some((t) => t.startsWith('DYNAMIC_'));

			if (isDynamicList) {
				// Get all possible options from dynamic lists
				let options: string[] = [];

				type.forEach((t) => {
					if (t.startsWith('DYNAMIC_')) {
						const listName = t as keyof typeof dynamicLists;
						if (dynamicLists[listName]) {
							options = [...options, ...dynamicLists[listName]];
						}
					} else if (typeof t === 'string' && !t.startsWith('DYNAMIC_')) {
						options.push(t);
					}
				});

				// Render autocomplete for large lists
				return (
					<Controller
						name={`fields.${index}.value`}
						control={control}
						defaultValue={multiple ? [] : null}
						rules={{ required: required ? `${name} is required` : false }}
						render={({ field: { onChange, value, ...restField } }) => (
							<Autocomplete
								{...restField}
								multiple={multiple}
								options={options}
								getOptionLabel={(option) => option}
								renderInput={(params) => (
									<TextField
										{...params}
										label={name}
										size='small'
										error={!!errors.fields?.[index]?.value}
										helperText={errors.fields?.[index]?.value?.message}
									/>
								)}
								value={value || (multiple ? [] : null)}
								onChange={(_, newValue) => {
									onChange(newValue);
									updateFieldValue(kuId, id, newValue);
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
			} else {
				// Regular dropdown for small lists
				return (
					<Controller
						name={`fields.${index}.value`}
						control={control}
						defaultValue={multiple ? [] : ''}
						rules={{ required: required ? `${name} is required` : false }}
						render={({ field: renderField }) => (
							<FormControl
								fullWidth
								size='small'
								error={!!errors.fields?.[index]?.value}
								onMouseEnter={() => setHoveredField(id)}
								onMouseLeave={() => setHoveredField(null)}
							>
								<Select
									{...renderField}
									multiple={multiple}
									displayEmpty
									renderValue={(selected) => {
										if (multiple) {
											return (
												<Box
													sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
												>
													{(selected as string[]).map((value) => (
														<Chip key={value} label={value} size='small' />
													))}
												</Box>
											);
										}
										return selected ? (
											selected
										) : (
											<Typography color='text.secondary'>{name}</Typography>
										);
									}}
									onChange={(e) => {
										renderField.onChange(e);
										updateFieldValue(kuId, id, e.target.value);
									}}
								>
									{type.map((option) => (
										<MenuItem key={option} value={option}>
											{option}
										</MenuItem>
									))}
								</Select>
								{errors.fields?.[index]?.value && (
									<FormHelperText>
										{errors.fields?.[index]?.value?.message}
									</FormHelperText>
								)}
							</FormControl>
						)}
					/>
				);
			}
		}

		// Default fallback
		return (
			<Typography color='error'>
				Unsupported field type: {JSON.stringify(type)}
			</Typography>
		);
	};

	const handleHighlightFieldClick = () => {
		const highlightFieldId =
			useAnnotationStore.getState().activeHighlightFieldId;
		if (highlightFieldId === id) {
			setActiveHighlightField(null);
		} else {
			setActiveHighlightField(id);
		}
	};

	return (
		<Box
			sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
			onMouseEnter={() => setHoveredField(id)}
			onMouseLeave={() => setHoveredField(null)}
		>
			<Box sx={{ flexGrow: 1 }}>{renderFieldInput()}</Box>
			<IconButton
				sx={{
					ml: 1,
					// Apply border when active
					border: isActive ? 2 : 0,
					borderColor: isActive ? 'primary.main' : 'transparent',
					// Handle icon color based on highlights
					color: hasHighlights ? getFieldColor() : 'black',
				}}
				onClick={handleHighlightFieldClick}
				aria-label='Highlight evidence'
				onMouseEnter={() => setHoveredField(id)}
				onMouseLeave={() => setHoveredField(null)}
			>
				<HighlightIcon />
			</IconButton>
			{!required && (
				<IconButton
					sx={{ ml: 1 }}
					color='error'
					onClick={() => removeFieldFromKU(kuId, id)}
					aria-label='Remove field'
					onMouseEnter={() => setHoveredField(id)}
					onMouseLeave={() => setHoveredField(null)}
				>
					<DeleteIcon />
				</IconButton>
			)}
		</Box>
	);
};

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