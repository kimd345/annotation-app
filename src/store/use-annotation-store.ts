import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationStore, ActiveCustomField, Highlight } from '../types';

// Note: We're keeping this store for UI state management,
// but data fetching is now handled by Tanstack Query

const useAnnotationStore = create<AnnotationStore>((set, get) => ({
	// Initial state - most data now comes from API
	documents: [],
	knowledgeUnitSchemas: [],
	knowledgeUnits: [],
	selectedDocumentId: null,
	activeHighlightFieldId: null,
	hoveredFieldId: null,
	customFieldTypes: [],
	isCustomFieldModalOpen: false,
	activeCustomField: null,

	// Actions
	selectDocument: (documentId) => {
		set({ selectedDocumentId: documentId });
	},

	addKnowledgeUnit: (schemaId) => {
		// This remains as a placeholder, but the actual data saving happens
		// through the Tanstack Query mutation
		const { selectedDocumentId, knowledgeUnitSchemas } = get();

		if (!selectedDocumentId) return;

		const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);
		if (!schema) return;

		// Create a new KU with required fields only and return it
		return {
			id: uuidv4(),
			schemaId,
			documentId: selectedDocumentId,
			fields: schema.fields
				.filter((f) => f.required)
				.map((f) => ({
					...f,
					highlights: [],
					// Initialize value based on field type
					value: f.multiple ? [] : '',
				})),
		};
	},

	// This will only update the local state temporarily
	// Actual updates are handled through mutations
	updateFieldValue: (kuId, fieldId, value) => {
		set((state) => ({
			knowledgeUnits: state.knowledgeUnits.map((ku) =>
				ku.id === kuId
					? {
							...ku,
							fields: ku.fields.map((field) =>
								field.id === fieldId ? { ...field, value } : field
							),
					  }
					: ku
			),
		}));
	},

	// Same with adding fields - local state only
	addFieldToKU: (kuId, fieldId) => {
		const { knowledgeUnits, knowledgeUnitSchemas } = get();

		const ku = knowledgeUnits.find((ku) => ku.id === kuId);
		if (!ku) return;

		const schema = knowledgeUnitSchemas.find((s) => s.frameId === ku.schemaId);
		if (!schema) return;

		const fieldSchema = schema.fields.find((f) => f.id === fieldId);
		if (!fieldSchema) return;

		// Check if this is a custom field type
		if (
			typeof fieldSchema.type === 'string' &&
			fieldSchema.type.startsWith('CUSTOM_')
		) {
			// Open the modal instead of adding the field immediately
			const openCustomFieldModal = get().openCustomFieldModal;
			// @ts-expect-error
			openCustomFieldModal(kuId, fieldId, fieldSchema.type, true);
			return;
		}

		// For regular fields, add them immediately as before
		set((state) => ({
			knowledgeUnits: state.knowledgeUnits.map((ku) =>
				ku.id === kuId
					? {
							...ku,
							fields: [...ku.fields, { ...fieldSchema, highlights: [] }],
					  }
					: ku
			),
		}));
	},

	removeFieldFromKU: (kuId, fieldId) => {
		set((state) => ({
			knowledgeUnits: state.knowledgeUnits.map((ku) =>
				ku.id === kuId
					? {
							...ku,
							fields: ku.fields.filter((field) => field.id !== fieldId),
					  }
					: ku
			),
		}));
	},

	setActiveHighlightField: (fieldId) => {
		set({ activeHighlightFieldId: fieldId });
	},

	setHoveredField: (fieldId) => {
		set({ hoveredFieldId: fieldId });
	},

	// Custom field modal actions
	openCustomFieldModal: (kuId, fieldId, fieldType, isNewField = false) => {
		const activeCustomField: ActiveCustomField = {
			kuId,
			fieldId,
			fieldType,
			isNewField,
		};
		set({
			isCustomFieldModalOpen: true,
			activeCustomField,
		});
	},

	closeCustomFieldModal: () => {
		set({
			isCustomFieldModalOpen: false,
			activeCustomField: null,
		});
	},

	addHighlight: (highlight) => {
		const highlightWithId = { ...highlight, id: uuidv4() };

		set((state) => ({
			knowledgeUnits: state.knowledgeUnits.map((ku) =>
				ku.id === highlight.kuId
					? {
							...ku,
							fields: ku.fields.map((field) =>
								field.id === highlight.fieldId
									? {
											...field,
											highlights: [...field.highlights, highlightWithId],
									  }
									: field
							),
					  }
					: ku
			),
		}));
	},

	removeHighlight: (highlightId) => {
		set((state) => ({
			knowledgeUnits: state.knowledgeUnits.map((ku) => ({
				...ku,
				fields: ku.fields.map((field) => ({
					...field,
					highlights: field.highlights.filter((h) => h.id !== highlightId),
				})),
			})),
		}));
	},

	findFieldByHighlightId: (highlightId) => {
		const { knowledgeUnits } = get();
		for (const ku of knowledgeUnits) {
			for (const field of ku.fields) {
				const highlight = field.highlights.find((h) => h.id === highlightId) as
					| Highlight
					| undefined;
				if (highlight) {
					return { kuId: ku.id, fieldId: field.id, highlight };
				}
			}
		}
		return null;
	},

	// In real implementation, this would now call the API
	exportAnnotations: () => {
		const { knowledgeUnits, documents } = get();

		// This function is no longer needed as we'll use the API directly
		// Keeping it for backward compatibility
		return {
			documents,
			knowledgeUnits,
		};
	},

	// New utility methods to update store from API responses
	setDocuments: (documents) => {
		set({ documents });
	},

	setKnowledgeUnitSchemas: (schemas) => {
		set({ knowledgeUnitSchemas: schemas });
	},

	setKnowledgeUnits: (units) => {
		set({ knowledgeUnits: units });
	},

	setCustomFieldTypes: (types) => {
		set({ customFieldTypes: types });
	},
}));

export default useAnnotationStore;
