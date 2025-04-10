import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { KnowledgeUnit, AnnotationStore } from '../types';

const useAnnotationStore = create<AnnotationStore>((set, get) => ({
	// Initial state
	documents: [],
	knowledgeUnitSchemas: [],
	knowledgeUnits: [],
	selectedDocumentId: null,
	activeHighlightFieldId: null,
	highlights: [], // Added highlights property to match AnnotationStore type

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

	addFieldToKU: (kuId, fieldId) => {
		const { knowledgeUnits, knowledgeUnitSchemas } = get();

		const ku = knowledgeUnits.find((ku) => ku.id === kuId);
		if (!ku) return;

		const schema = knowledgeUnitSchemas.find((s) => s.frameId === ku.schemaId);
		if (!schema) return;

		const fieldSchema = schema.fields.find((f) => f.id === fieldId);
		if (!fieldSchema) return;

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

	exportAnnotations: () => {
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
