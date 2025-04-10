import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
	Box,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	Select,
	MenuItem,
	FormControl,
	FormHelperText,
	IconButton,
	Autocomplete,
	FormLabel,
	Chip,
	Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightIcon from '@mui/icons-material/Highlight';
import useAnnotationStore from '../../store/use-annotation-store';
import { dynamicLists } from '../../lib/mock-data';
import { useShallow } from 'zustand/shallow';

// Custom field types renderer
const FieldInput = ({
	field,
	control,
	errors,
	index,
	kuId,
	setActiveHighlightField,
}) => {
	const { type, name, id, multiple, required } = field;

	// Get field value from store
	const updateFieldValue = useAnnotationStore(
		useShallow((state) => state.updateFieldValue)
	);

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
							error={!!errors.fields?.[index]?.value}
							helperText={errors.fields?.[index]?.value?.message}
							onChange={(e) => {
								renderField.onChange(e);
								updateFieldValue(kuId, id, e.target.value);
							}}
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

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
			<Box sx={{ flexGrow: 1 }}>{renderFieldInput()}</Box>
			<IconButton
				sx={{ ml: 1 }}
				color='primary'
				onClick={() => setActiveHighlightField(id)}
				aria-label='Highlight evidence'
			>
				<HighlightIcon />
			</IconButton>
			{!required && (
				<IconButton sx={{ ml: 1 }} color='error' aria-label='Remove field'>
					<DeleteIcon />
				</IconButton>
			)}
		</Box>
	);
};

// Main KU Form component
const KnowledgeUnitForm = ({ kuId, schemaId }) => {
	const { knowledgeUnits, knowledgeUnitSchemas, setActiveHighlightField } =
		useAnnotationStore(useShallow((state) => ({
			knowledgeUnits: state.knowledgeUnits,
			knowledgeUnitSchemas: state.knowledgeUnitSchemas,
			setActiveHighlightField: state.setActiveHighlightField,
		})));

	// Find the KU and its schema
	const ku = knowledgeUnits.find((ku) => ku.id === kuId);
	const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);

	const [showOptionFields, setShowOptionFields] = useState(false);

	// If KU or schema not found, return error
	if (!ku || !schema) {
		return <Typography color='error'>Knowledge Unit not found</Typography>;
	}

	// Setup form
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			fields: ku.fields,
		},
	});

	// Get optional fields not yet added
	const availableOptionalFields = schema.fields.filter(
		(schemaField) =>
			!schemaField.required &&
			!ku.fields.some((field) => field.id === schemaField.id)
	);

	// Handle adding an optional field
	const handleAddField = (fieldId) => {
		const addFieldToKU = useAnnotationStore.getState().addFieldToKU;
		addFieldToKU(kuId, fieldId);
		setShowOptionFields(false);
	};

	// Handle form submission
	const onSubmit = (data) => {
		console.log('Form submitted:', data);
		// You can trigger validation and export here
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
						<FieldInput
							key={field.id}
							field={field}
							index={index}
							control={control}
							errors={errors}
							kuId={kuId}
							setActiveHighlightField={setActiveHighlightField}
						/>
					))}

					{/* Add optional field button */}
					{availableOptionalFields.length > 0 && (
						<Box sx={{ mb: 2 }}>
							<Button
								startIcon={<AddIcon />}
								size='small'
								onClick={() => setShowOptionFields(!showOptionFields)}
								variant='outlined'
							>
								Add Field
							</Button>

							{/* Optional fields dropdown */}
							{showOptionFields && (
								<Stack spacing={1} sx={{ mt: 1, ml: 2 }}>
									{availableOptionalFields.map((field) => (
										<Button
											key={field.id}
											size='small'
											onClick={() => handleAddField(field.id)}
											variant='text'
											startIcon={<AddIcon />}
										>
											{field.name}
										</Button>
									))}
								</Stack>
							)}
						</Box>
					)}
				</form>
			</CardContent>
		</Card>
	);
};

export default KnowledgeUnitForm;
