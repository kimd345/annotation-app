import { Controller, Control, FieldErrors } from 'react-hook-form';
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
		highlights?: Array<{ id: string }>;
	};
	control: Control;
	errors: FieldErrors<{ fields: { value: unknown }[] }>;
	index: number;
	kuId: string;
	setActiveHighlightField: (id: string | null) => void;
}) => {
	const { type, name, id, multiple, required } = field;

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
	const getFieldColor = () => getColorForField(id);

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

		// Handle custom field types
		if (typeof type === 'string' && type.startsWith('CUSTOM_')) {
			return (
				<Controller
					name={`fields.${index}.value`}
					control={control}
					defaultValue=''
					rules={{ required: required ? `${name} is required` : false }}
					render={({ field: renderField }) => (
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
							<TextField
								{...renderField}
								fullWidth
								size='small'
								label={name}
								error={!!errors.fields?.[index]?.value?.message}
								helperText={errors.fields?.[index]?.value?.message}
								disabled={true}
								value={
									renderField.value
										? JSON.stringify(renderField.value).substring(0, 20) + '...'
										: ''
								}
								onMouseEnter={() => setHoveredField(id)}
								onMouseLeave={() => setHoveredField(null)}
							/>
							<IconButton
								onClick={() => {
									// Open custom field modal
									// This will be implemented in the CustomFieldModal component
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

	// Function to clear all highlights for this field
	const handleClearAllHighlights = () => {
		const highlights = getFieldHighlights();
		highlights.forEach((highlight) => {
			removeHighlight(highlight.id);
		});
	};

	return (
		<Box
			sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
			onMouseEnter={() => setHoveredField(id)}
			onMouseLeave={() => setHoveredField(null)}
		>
			<Box sx={{ flexGrow: 1 }}>{renderFieldInput()}</Box>

			{/* Highlight button with badge showing count */}
			<Badge
				badgeContent={fieldHighlights.length}
				color='primary'
				invisible={!hasHighlights}
				sx={{ mx: 1 }}
			>
				<IconButton
					sx={{
						// Updated styling - removed border when focused, only show border when active
						borderColor: isActive ? getFieldColor() : 'transparent',
						borderWidth: isActive ? 1 : 0,
						borderStyle: 'solid',
						// Handle icon color based on highlights
						color: hasHighlights ? getFieldColor() : 'action.disabled',
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
		</Box>
	);
};

export default FieldInput;
