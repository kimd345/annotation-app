// src/features/annotations/field-input.tsx
import {
	Controller,
	Control,
	FieldErrors,
	useFormContext,
} from 'react-hook-form';
import {
	Autocomplete,
	Badge,
	Box,
	Chip,
	FormControl,
	FormHelperText,
	IconButton,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HighlightIcon from '@mui/icons-material/Highlight';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { dynamicLists } from '@/lib/mock-data';
import { getColorForField } from '@/utils/format';

// Custom field types renderer
const FieldInput = ({
	field,
	index,
	control,
	errors,
	kuId,
	setActiveHighlightField,
	validateHighlights,
	required,
}: {
	field: {
		type: string | string[];
		name: string;
		id: string;
		multiple?: boolean;
		required?: boolean;
		highlights?: Array<{ id: string }>;
	};
	control: Control;
	errors: FieldErrors<{ fields: { value: unknown; highlights: unknown[] }[] }>;
	index: number;
	kuId: string;
	setActiveHighlightField: (id: string | null) => void;
	validateHighlights: (
		highlights: any[],
		fieldId: string,
		required: boolean
	) => boolean | string;
	required: boolean;
}) => {
	const { type, name, id, multiple } = field;

	// Get form context for additional validation
	const { getValues, setValue, register, trigger } = useFormContext();

	// Get field value and state from store
	const {
		updateFieldValue,
		removeFieldFromKU,
		setHoveredField,
		knowledgeUnits,
		activeHighlightFieldId,
		removeHighlight,
	} = useAnnotationStore(
		useShallow((state) => ({
			updateFieldValue: state.updateFieldValue,
			removeFieldFromKU: state.removeFieldFromKU,
			setHoveredField: state.setHoveredField,
			knowledgeUnits: state.knowledgeUnits,
			activeHighlightFieldId: state.activeHighlightFieldId,
			removeHighlight: state.removeHighlight,
		}))
	);

	// Function to get field highlights
	const getFieldHighlights = () => {
		try {
			const ku = knowledgeUnits.find((ku) => ku.id === kuId);
			if (!ku) return [];

			const fieldData = ku.fields.find((f) => f.id === id);
			return fieldData?.highlights || [];
		} catch (error) {
			console.error('Error getting field highlights:', error);
			return [];
		}
	};

	// Get the field's highlight state
	const fieldHighlights = getFieldHighlights();
	const hasHighlights = fieldHighlights.length > 0;
	const isActive = activeHighlightFieldId === id;

	// Get field color for highlights
	const getFieldColor = () => getColorForField(id);

	// Check if field has validation errors
	const hasFieldError = !!errors?.fields?.[index]?.value;
	const hasHighlightError = !!errors?.fields?.[index]?.highlights;

	// Set up validation rules based on field type
	const getValidationRules = () => {
		const rules: any = {};

		// Required field validation with special handling for multiple select
		if (required) {
			if (multiple) {
				// For multiple select, validate array length instead of using 'required'
				rules.validate = {
					...rules.validate,
					required: (value: any) => {
						return (
							(Array.isArray(value) && value.length > 0) ||
							`${name} is required`
						);
					},
				};
			} else {
				rules.required = `${name} is required`;
			}
		}

		// Type-specific validation
		if (type === 'integer') {
			rules.pattern = {
				value: /^-?\d+$/,
				message: 'Please enter a valid integer',
			};

			// Convert to number on validation
			rules.setValueAs = (value: string) =>
				value === '' ? '' : parseInt(value, 10);
		}

		// Add highlight validation
		rules.validate = {
			...(rules.validate || {}),
			highlights: (value: any) =>
				validateHighlights(fieldHighlights, id, required),
		};

		return rules;
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
					rules={getValidationRules()}
					render={({ field: renderField, fieldState }) => (
						<TextField
							{...renderField}
							fullWidth
							size='small'
							label={name}
							error={!!fieldState.error}
							helperText={fieldState.error?.message}
							onChange={(e) => {
								renderField.onChange(e);
								updateFieldValue(kuId, id, e.target.value);
								// Register highlights for validation
								register(`fields.${index}.highlights`, {
									validate: () =>
										validateHighlights(fieldHighlights, id, required),
								});
								trigger(`fields.${index}.highlights`);
							}}
							onMouseEnter={() => setHoveredField(id)}
							onMouseLeave={() => setHoveredField(null)}
							required={required}
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
					rules={getValidationRules()}
					render={({ field: renderField, fieldState }) => (
						<TextField
							{...renderField}
							fullWidth
							size='small'
							label={name}
							type='number'
							error={!!fieldState.error}
							helperText={fieldState.error?.message}
							onChange={(e) => {
								renderField.onChange(e);
								const value =
									e.target.value === '' ? '' : parseInt(e.target.value, 10);
								updateFieldValue(kuId, id, value);
								trigger(`fields.${index}.highlights`);
							}}
							onMouseEnter={() => setHoveredField(id)}
							onMouseLeave={() => setHoveredField(null)}
							required={required}
						/>
					)}
				/>
			);
		}

		// Handle custom field types
		if (typeof type === 'string' && type.startsWith('CUSTOM_')) {
			return (
				<Controller
					name={`fields.${index}.value`}
					control={control}
					defaultValue=''
					rules={getValidationRules()}
					render={({ field: renderField, fieldState }) => (
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
							<TextField
								{...renderField}
								fullWidth
								size='small'
								label={name}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={true}
								value={
									renderField.value
										? typeof renderField.value === 'object'
											? JSON.stringify(renderField.value).substring(0, 20) +
											  '...'
											: renderField.value
										: ''
								}
								onMouseEnter={() => setHoveredField(id)}
								onMouseLeave={() => setHoveredField(null)}
								required={required}
							/>
							<IconButton
								onClick={() => {
									// Open custom field modal
									const openCustomFieldModal =
										useAnnotationStore.getState().openCustomFieldModal;
									openCustomFieldModal(kuId, id, type);
								}}
							>
								<Tooltip title='View or edit custom field'>
									<EditIcon />
								</Tooltip>
							</IconButton>
						</Box>
					)}
				/>
			);
		}

		// Handle dropdown type (array of options)
		if (Array.isArray(type)) {
			// Check if it's a dynamic list or special list type
			const isDynamicList = type.some((t) => t.startsWith('DYNAMIC_'));
			const isSpecialList = type.some((t) => t.startsWith('LIST_'));
			const isList = isDynamicList || isSpecialList;

			if (isList) {
				// Get all possible options from dynamic lists
				let options: string[] = [];

				type.forEach((t) => {
					if (t.startsWith('DYNAMIC_')) {
						const listName = t as keyof typeof dynamicLists;
						if (dynamicLists[listName]) {
							options = [...options, ...dynamicLists[listName]];
						}
					} else if (t === 'LIST_PERSON') {
						// Map LIST_PERSON to DYNAMIC_PEOPLE
						options = [...options, ...dynamicLists['DYNAMIC_PEOPLE']];
					} else if (t === 'LIST_COMPANY') {
						// Map LIST_COMPANY to DYNAMIC_ORG
						options = [...options, ...dynamicLists['DYNAMIC_ORG']];
					} else if (
						typeof t === 'string' &&
						!t.startsWith('DYNAMIC_') &&
						!t.startsWith('LIST_')
					) {
						options.push(t);
					}
				});

				// We don't need placeholder options anymore since we properly map list types
				// to their data sources

				// Render autocomplete for large lists
				return (
					<Controller
						name={`fields.${index}.value`}
						control={control}
						defaultValue={multiple ? [] : null}
						rules={getValidationRules()}
						render={({
							field: { onChange, value, ...restField },
							fieldState,
						}) => (
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
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										required={required}
									/>
								)}
								value={value || (multiple ? [] : null)}
								onChange={(_, newValue) => {
									onChange(newValue);
									updateFieldValue(kuId, id, newValue);
									trigger(`fields.${index}.highlights`);
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
						rules={getValidationRules()}
						render={({ field: renderField, fieldState }) => (
							<FormControl
								fullWidth
								size='small'
								error={!!fieldState.error}
								required={required}
								onMouseEnter={() => setHoveredField(id)}
								onMouseLeave={() => setHoveredField(null)}
							>
								<Select
									{...renderField}
									multiple={multiple}
									displayEmpty
									renderValue={(selected) => {
										if (multiple) {
											// Ensure selected is always an array
											const selectedArray = Array.isArray(selected)
												? selected
												: selected
												? [selected]
												: [];
											return (
												<Box
													sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
												>
													{selectedArray.map((value) => (
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
										trigger(`fields.${index}.highlights`);
									}}
								>
									{type.map((option) => (
										<MenuItem key={option} value={option}>
											{option}
										</MenuItem>
									))}
								</Select>
								{fieldState.error && (
									<FormHelperText>{fieldState.error.message}</FormHelperText>
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

	// Function to clear all highlights for this field
	const handleClearAllHighlights = () => {
		const highlights = getFieldHighlights();
		highlights.forEach((highlight) => {
			removeHighlight(highlight.id);
		});

		// Trigger validation after removing highlights
		trigger(`fields.${index}.highlights`);
	};

	// Register highlights field for validation
	register(`fields.${index}.highlights`, {
		validate: () => validateHighlights(fieldHighlights, id, required),
	});

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				mb: 2,
				// Add highlight error state
				...(hasHighlightError && {
					pb: 2,
					position: 'relative',
				}),
			}}
			onMouseEnter={() => setHoveredField(id)}
			onMouseLeave={() => setHoveredField(null)}
		>
			<Box sx={{ flexGrow: 1 }}>{renderFieldInput()}</Box>

			{/* Highlight button with badge showing count */}
			<Badge
				badgeContent={fieldHighlights.length}
				color={hasHighlightError ? 'error' : 'primary'}
				invisible={!hasHighlights}
				sx={{ mx: 1 }}
			>
				<IconButton
					sx={{
						// Updated styling - show error state
						borderColor: hasHighlightError
							? 'error.main'
							: isActive
							? getFieldColor()
							: 'transparent',
						borderWidth: isActive || hasHighlightError ? 1 : 0,
						borderStyle: 'solid',
						// Handle icon color based on highlights
						color: hasHighlightError
							? 'error.main'
							: hasHighlights
							? getFieldColor()
							: 'action.disabled',
						// Remove focus outline/border
						'&:focus': {
							outline: 'none',
						},
						'&.Mui-focusVisible': {
							outline: 'none',
							border: 'none',
						},
					}}
					onClick={handleHighlightFieldClick}
					aria-label='Highlight evidence'
				>
					<HighlightIcon />
				</IconButton>
			</Badge>

			{/* Clear all highlights button - only visible when highlights exist */}
			{hasHighlights && (
				<Tooltip title='Clear all highlights'>
					<IconButton
						size='small'
						onClick={handleClearAllHighlights}
						color='default'
						sx={{ mr: 1 }}
					>
						<ClearIcon fontSize='small' />
					</IconButton>
				</Tooltip>
			)}

			{/* Delete field button for optional fields */}
			{!required && (
				<IconButton
					color='error'
					onClick={() => removeFieldFromKU(kuId, id)}
					aria-label='Remove field'
				>
					<DeleteIcon />
				</IconButton>
			)}

			{/* Only show highlight error message if there isn't already a field error shown */}
			{hasHighlightError && !hasFieldError && (
				<FormHelperText
					error
					sx={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						ml: 0, // Remove default indentation
					}}
				>
					Evidence highlighting required
				</FormHelperText>
			)}
		</Box>
	);
};

export default FieldInput;
