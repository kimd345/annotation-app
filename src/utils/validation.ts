// src/utils/validation.ts
import { Field, KnowledgeUnit, CustomFieldType } from '@/types';

/**
 * Utility functions for form validation
 */

/**
 * Validates if at least one of the custom field values is filled
 * @param values Object containing field values
 * @returns true if valid, error message if invalid
 */
export const validateCustomFieldHasValue = (
	values: Record<string, any>
): boolean | string => {
	if (!values) return 'Field cannot be empty';

	const hasValue = Object.values(values).some(
		(value) =>
			value !== null &&
			value !== undefined &&
			value !== '' &&
			(typeof value !== 'object' || (Array.isArray(value) && value.length > 0))
	);

	return hasValue || 'At least one field must have a value';
};

/**
 * Validates a field value based on its type
 * @param value The value to validate
 * @param fieldType The type of the field
 * @returns true if valid, error message if invalid
 */
export const validateFieldValue = (
	value: any,
	fieldType: string | string[]
): boolean | string => {
	// Skip empty values for optional fields
	if (value === null || value === undefined || value === '') {
		return true;
	}

	// Handle string type
	if (fieldType === 'string') {
		return typeof value === 'string' || 'Must be a valid text';
	}

	// Handle integer type
	if (fieldType === 'integer') {
		if (typeof value === 'number' && Number.isInteger(value)) {
			return true;
		}
		if (typeof value === 'string' && /^-?\d+$/.test(value)) {
			return true;
		}
		return 'Must be a valid integer';
	}

	// Handle dropdown/select types (array of options)
	if (Array.isArray(fieldType)) {
		// Check if this is a LIST type or DYNAMIC list
		const isDynamicOrList = fieldType.some(
			(t) => t.startsWith('DYNAMIC_') || t.startsWith('LIST_')
		);

		// For multiple selections
		if (Array.isArray(value)) {
			// Skip empty arrays
			if (value.length === 0) return true;

			// For dynamic lists, we skip strict validation
			if (isDynamicOrList) {
				return true;
			}

			// For static lists, validate each value is in the options
			const allValid = value.every((v) => fieldType.includes(v));
			return allValid || 'Contains invalid selection options';
		}

		// For single selection
		// Skip validation for dynamic/list types as the values might come from external sources
		if (isDynamicOrList) {
			return true;
		}

		return fieldType.includes(value) || value === '' || 'Not a valid option';
	}

	// Handle custom field types
	if (typeof fieldType === 'string' && fieldType.startsWith('CUSTOM_')) {
		// Validate that the value is an object
		if (typeof value !== 'object' || value === null) {
			return 'Invalid custom field value';
		}

		// The detailed validation is done in the custom field modal
		return true;
	}

	// Default case: accept the value
	return true;
};

/**
 * Validates if a field has the required highlights
 * @param field The field to validate
 * @param isRequired Whether the field is required
 * @returns true if valid, error message if invalid
 */
export const validateFieldHighlights = (
	field: Field,
	isRequired: boolean
): boolean | string => {
	// Skip validation for optional empty fields
	const isEmpty =
		field.value === undefined ||
		field.value === null ||
		field.value === '' ||
		(Array.isArray(field.value) && field.value.length === 0);

	if (!isRequired && isEmpty) {
		return true;
	}

	// All fields with values should have highlights
	return field.highlights.length > 0 || 'Evidence highlighting required';
};

/**
 * Validates an entire Knowledge Unit
 * @param ku The knowledge unit to validate
 * @param schema The schema for this KU
 * @returns Object with isValid flag and errors by field
 */
export const validateKnowledgeUnit = (
	ku: KnowledgeUnit,
	schema: {
		fields: Array<{
			id: string;
			name: string;
			required: boolean;
			type: string | string[];
		}>;
	}
): {
	isValid: boolean;
	errors: Record<string, string[]>;
} => {
	const errors: Record<string, string[]> = {};

	// Check all fields in the KU
	ku.fields.forEach((field) => {
		const fieldErrors: string[] = [];
		const schemaField = schema.fields.find((f) => f.id === field.id);

		if (!schemaField) {
			fieldErrors.push('Field not found in schema');
		} else {
			// Validate required fields have values
			if (schemaField.required) {
				const isEmpty =
					field.value === undefined ||
					field.value === null ||
					field.value === '' ||
					(Array.isArray(field.value) && field.value.length === 0);

				if (isEmpty) {
					fieldErrors.push(`${schemaField.name} is required`);
				}
			}

			// Validate field type
			const typeValidation = validateFieldValue(field.value, field.type);
			if (typeValidation !== true) {
				fieldErrors.push(typeValidation);
			}

			// Validate highlights
			if (
				field.value !== undefined &&
				field.value !== null &&
				field.value !== ''
			) {
				if (field.highlights.length === 0) {
					fieldErrors.push('Evidence highlighting required');
				}
			}
		}

		if (fieldErrors.length > 0) {
			errors[field.id] = fieldErrors;
		}
	});

	// Check for required fields missing from KU
	schema.fields
		.filter((schemaField) => schemaField.required)
		.forEach((requiredField) => {
			const hasField = ku.fields.some((field) => field.id === requiredField.id);
			if (!hasField) {
				errors[requiredField.id] = [
					`Missing required field: ${requiredField.name}`,
				];
			}
		});

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
};
