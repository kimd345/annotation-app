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

// Zustand store
export interface AnnotationStore {
	// Data
	documents: Document[];
	knowledgeUnitSchemas: KnowledgeUnitSchema[];
	knowledgeUnits: KnowledgeUnit[];
	// highlights: Highlight[];

	// UI state
	selectedDocumentId: string | null;
	activeHighlightFieldId: string | null;
	hoveredFieldId: string | null;
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
	exportAnnotations: () => Record<string, unknown>;
}
