// Data models
export interface Document {
	id: string;
	title: string;
	content: string;
	fileName: string;
	hasAnnotations: boolean;
}

export interface Field {
	id: string;
	name: string;
	type: string | string[];
	required: boolean;
	multiple: boolean;
	value?: unknown;
	highlights: Highlight[];
}

export interface Highlight {
	id: string;
	startOffset: number;
	endOffset: number;
	text: string;
	fieldId: string;
	kuId: string;
}

export interface KnowledgeUnitSchema {
	frameLabel: string;
	frameId: string;
	fields: {
		name: string;
		id: string;
		type: string | string[];
		required: boolean;
		multiple: boolean;
	}[];
}

export interface KnowledgeUnit {
	id: string;
	schemaId: string;
	documentId: string;
	fields: Field[];
}

// New custom field type interface
export interface CustomFieldType {
	typeId: string;
	typeLabel: string;
	fields: {
		id: string;
		name: string;
		type: string | string[];
		required: boolean;
	}[];
}

// Updated ActiveCustomField interface
export interface ActiveCustomField {
  kuId: string;
  fieldId: string;
  fieldType: string;
  isNewField?: boolean; // Add this optional flag
}

// Zustand store
export interface AnnotationStore {
	// Data
	// TODO: is intersection type the right way to do this? (addressing issue in App.tsx initializeStore)
	documents: Document[] // & ((docs: Document[]) => void);
	knowledgeUnitSchemas: KnowledgeUnitSchema[] // & ((schemas: KnowledgeUnitSchema[]) => void);
	knowledgeUnits: KnowledgeUnit[];
	customFieldTypes: CustomFieldType[]; // New field for custom types

	// UI state
	selectedDocumentId: string | null;
	activeHighlightFieldId: string | null;
	hoveredFieldId: string | null;
	isCustomFieldModalOpen: boolean; // New field for modal state
	activeCustomField: ActiveCustomField | null; // New field for active custom field
	findFieldByHighlightId: (
		highlightId: string
	) => { kuId: string; fieldId: string; highlight: Highlight } | null;

	// Actions
	selectDocument: (documentId: string) => void;
	addKnowledgeUnit: (schemaId: string) => void;
	updateFieldValue: (kuId: string, fieldId: string, value: unknown) => void;
	addFieldToKU: (kuId: string, fieldId: string) => void;
	removeFieldFromKU: (kuId: string, fieldId: string) => void;
	setActiveHighlightField: (fieldId: string | null) => void;
	setHoveredField: (fieldId: string | null) => void;
	addHighlight: (highlight: Omit<Highlight, 'id'>) => void;
	removeHighlight: (highlightId: string) => void;
	openCustomFieldModal: (
		kuId: string,
		fieldId: string,
		fieldType: string
	) => void; // New action
	closeCustomFieldModal: () => void; // New action
	exportAnnotations: () => Record<string, unknown>;
}
