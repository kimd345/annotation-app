import { Control, FieldErrors, useFormContext } from 'react-hook-form';
import {
	Box,
	FormHelperText,
	IconButton,
	Typography,
	Tooltip,
	Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { useFieldValidation } from '@/hooks/use-field-validation';
import StringField from '@/components/fields/StringField';
import IntegerField from '@/components/fields/IntegerField';
import CustomField from '@/components/fields/CustomField';
import SelectField from '@/components/fields/SelectField';
import AutocompleteField from '@/components/fields/AutocompleteField';
import HighlightButton from '@/components/fields/HighlightButton';
import { useKnowledgeUnitMutation } from '@/hooks/use-api';

// Main field input component
const FieldInput = ({
	field,
	index,
	control,
	errors,
	kuId,
	setActiveHighlightField,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	control: Control<any>;
	errors: FieldErrors<{ fields: { value: unknown; highlights: unknown[] }[] }>;
	index: number;
	kuId: string;
	setActiveHighlightField: (id: string | null) => void;
	validateHighlights: (
		highlights: Array<{ id: string }>,
		fieldId: string,
		required: boolean
	) => boolean | string;
	required: boolean;
}) => {
	// Ensure field is defined before destructuring
	if (!field) {
		console.error('Field is undefined in FieldInput component', {
			index,
			kuId,
		});
		return (
			<Alert severity='error' sx={{ mb: 2 }}>
				Error: Field data is missing. Please refresh the page or contact
				support.
			</Alert>
		);
	}

	const { type, name, id, multiple = false } = field;
	const { trigger } = useFormContext();

	// Get knowledge unit mutation hook for updating to backend
	const kuMutation = useKnowledgeUnitMutation();

	// Get field value and state from store
	const {
		removeFieldFromKU,
		setHoveredField,
		knowledgeUnits,
		activeHighlightFieldId,
		removeHighlight,
	} = useAnnotationStore(
		useShallow((state) => ({
			removeFieldFromKU: state.removeFieldFromKU,
			setHoveredField: state.setHoveredField,
			knowledgeUnits: state.knowledgeUnits,
			activeHighlightFieldId: state.activeHighlightFieldId,
			removeHighlight: state.removeHighlight,
		}))
	);

	// Find the current knowledge unit
	const currentKU = knowledgeUnits.find((ku) => ku.id === kuId);
	if (!currentKU) {
		console.error('Knowledge Unit not found', { kuId });
		return (
			<Alert severity='error' sx={{ mb: 2 }}>
				Error: Knowledge Unit data is missing. Please refresh the page.
			</Alert>
		);
	}

	// Function to get field highlights
	const getFieldHighlights = () => {
		try {
			const fieldData = currentKU.fields.find((f) => f.id === id);
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

	// Check if field has validation errors
	const hasFieldError = !!errors?.fields?.[index]?.value;
	const hasHighlightError = !!errors?.fields?.[index]?.highlights;

	// Use the validation hook
	const {
		getValidationRules,
		registerHighlightValidation,
		triggerHighlightValidation,
	} = useFieldValidation(id, name, type, required, index, fieldHighlights);

	// Handle highlight field toggle
	const handleHighlightFieldClick = () => {
		const highlightFieldId = activeHighlightFieldId;
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

	// Function to handle field deletion
	const handleDeleteField = () => {
		// First, update the local state
		removeFieldFromKU(kuId, id);

		// Then get the updated KU and send it to the backend
		setTimeout(() => {
			const updatedKU = useAnnotationStore
				.getState()
				.knowledgeUnits.find((ku) => ku.id === kuId);

			if (updatedKU) {
				kuMutation.mutate(updatedKU);
			}
		}, 0);
	};

	// Register highlights field for validation
	registerHighlightValidation();

	// Function to handle field type rendering
	const renderFieldInput = () => {
		// Handle string type
		if (type === 'string') {
			return (
				<StringField
					index={index}
					control={control}
					field={{
						id,
						name,
						required,
					}}
					kuId={kuId}
					required={required}
					setHoveredField={setHoveredField}
					triggerHighlightValidation={triggerHighlightValidation}
					validationRules={getValidationRules()}
				/>
			);
		}

		// Handle integer type
		if (type === 'integer') {
			return (
				<IntegerField
					index={index}
					control={control}
					field={{
						id,
						name,
						required,
					}}
					kuId={kuId}
					required={required}
					setHoveredField={setHoveredField}
					triggerHighlightValidation={triggerHighlightValidation}
					validationRules={getValidationRules()}
				/>
			);
		}

		// Handle custom field types
		if (typeof type === 'string' && type.startsWith('CUSTOM_')) {
			return (
				<CustomField
					index={index}
					control={control}
					field={{
						id,
						name,
						type,
						required,
					}}
					kuId={kuId}
					required={required}
					setHoveredField={setHoveredField}
					validationRules={getValidationRules()}
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
				// Render autocomplete for large lists
				return (
					<AutocompleteField
						index={index}
						control={control}
						field={{
							id,
							name,
							type,
							multiple,
							required,
						}}
						kuId={kuId}
						multiple={multiple}
						required={required}
						setHoveredField={setHoveredField}
						triggerHighlightValidation={triggerHighlightValidation}
						validationRules={getValidationRules()}
					/>
				);
			} else {
				// Regular dropdown for small lists
				return (
					<SelectField
						index={index}
						control={control}
						field={{
							id,
							name,
							type,
							multiple,
							required,
						}}
						kuId={kuId}
						multiple={multiple}
						required={required}
						setHoveredField={setHoveredField}
						triggerHighlightValidation={triggerHighlightValidation}
						validationRules={getValidationRules()}
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
			data-field-id={id}
		>
			<Box sx={{ flexGrow: 1 }}>{renderFieldInput()}</Box>

			{/* Highlight button component */}
			<HighlightButton
				fieldId={id}
				isActive={isActive}
				hasHighlights={hasHighlights}
				highlightCount={fieldHighlights.length}
				hasHighlightError={hasHighlightError}
				onHighlightClick={handleHighlightFieldClick}
				onClearAllHighlights={handleClearAllHighlights}
			/>

			{/* Delete field button for optional fields */}
			{!required && (
				<Tooltip title='Remove field'>
					<IconButton
						color='error'
						onClick={handleDeleteField}
						aria-label='Remove field'
					>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
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
