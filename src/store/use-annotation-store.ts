import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { KnowledgeUnit, AnnotationStore, ActiveCustomField } from '../types';
import { customFieldTypes } from '../lib/mock-data';

const useAnnotationStore = create<AnnotationStore>((set, get) => ({
	// Initial state
	documents: [],
	knowledgeUnitSchemas: [],
	knowledgeUnits: [],
	selectedDocumentId: null,
	activeHighlightFieldId: null,
	hoveredFieldId: null,
	customFieldTypes: customFieldTypes, // Initialize with the custom field types
	isCustomFieldModalOpen: false,
	activeCustomField: null,

	// Actions
	selectDocument: (documentId) => {
		set({ selectedDocumentId: documentId });
	},

	addKnowledgeUnit: (schemaId) => {
		const { selectedDocumentId, knowledgeUnitSchemas } = get();

		if (!selectedDocumentId) return;

		const schema = knowledgeUnitSchemas.find((s) => s.frameId === schemaId);
		if (!schema) return;

		// Create a new KU with required fields only
		const newKU: KnowledgeUnit = {
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

		set((state) => ({
			knowledgeUnits: [...state.knowledgeUnits, newKU],
			// Mark document as having annotations
			documents: state.documents.map((doc) =>
				doc.id === selectedDocumentId ? { ...doc, hasAnnotations: true } : doc
			),
		}));
	},

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

	// Modified version of addFieldToKU function
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
			openCustomFieldModal(kuId, fieldId, fieldSchema.type, true); // Pass 'true' to indicate this is a new field
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
	// Updated openCustomFieldModal function
	openCustomFieldModal: (kuId, fieldId, fieldType, isNewField = false) => {
		const activeCustomField: ActiveCustomField = {
			kuId,
			fieldId,
			fieldType,
			isNewField, // Add this flag to track if this is a new field
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
				const highlight = field.highlights.find((h) => h.id === highlightId);
				if (highlight) {
					return { kuId: ku.id, fieldId: field.id, highlight };
				}
			}
		}
		return null;
	},

	exportAnnotations: (): any => {
		const { knowledgeUnits, documents } = get();

		// Format the data as needed for export
		// This is a simplified version
		const exportData = documents.map((doc) => {
			const docKUs = knowledgeUnits.filter((ku) => ku.documentId === doc.id);

			return {
				documentId: doc.id,
				title: doc.title,
				knowledgeUnits: docKUs.map((ku) => ({
					kuId: ku.id,
					schemaId: ku.schemaId,
					fields: ku.fields.map((field) => ({
						fieldId: field.id,
						name: field.name,
						value: field.value,
						highlights: field.highlights.map((h) => ({
							text: h.text,
							startOffset: h.startOffset,
							endOffset: h.endOffset,
						})),
					})),
				})),
			};
		});

		return exportData;
	},
}));

export default useAnnotationStore;
