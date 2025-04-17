import { Document, KnowledgeUnitSchema } from '../types';
import { v4 as uuidv4 } from 'uuid';

const txtFilesModules = import.meta.glob('./txt/*.txt', { eager: true, as: 'raw' });

const loadTxtFiles = async (): Promise<Document[]> => {
	const documents: Document[] = [];

	// Process each file in the txt directory
	for (const path in txtFilesModules) {
		try {
			const content = txtFilesModules[path] as string;

			// Parse content to extract title
			const lines = content.split('\n');
			const title = lines[0] || 'Untitled Document';

			documents.push({
				id: uuidv4(),
				title: title,
				content: content,
				fileName: path.split('/').pop() || 'unknown.txt',
				hasAnnotations: false,
			});
		} catch (error) {
			console.error(`Error loading file ${path}:`, error);
		}
	}

	return documents;
};
// Sample documents
export const dummyDocuments: Document[] = await loadTxtFiles();

// Sample knowledge unit schemas
export const knowledgeUnitSchemas: KnowledgeUnitSchema[] = [
	{
		frameLabel: 'Employment',
		frameId: 'employment',
		fields: [
			{
				name: 'Person',
				id: 'person',
				type: ['LIST_PERSON'],
				required: true,
				multiple: true,
			},
			{
				name: 'Company',
				id: 'company',
				type: ['LIST_COMPANY'],
				required: false,
				multiple: true,
			},
			{
				name: 'Title',
				id: 'title',
				type: 'string',
				required: false,
				multiple: false,
			},
			{
				name: 'Department',
				id: 'dept',
				type: 'string',
				required: false,
				multiple: false,
			},
			{
				name: 'Time',
				id: 'time',
				type: ['email-date', 'past', 'future'],
				required: false,
				multiple: true,
			},
		],
	},
	{
		frameLabel: 'Sentiment',
		frameId: 'sentiment',
		fields: [
			{
				name: 'By',
				id: 'by',
				type: ['DYNAMIC_PEOPLE'],
				required: true,
				multiple: false,
			},
			{
				name: 'Towards',
				id: 'towards',
				type: ['DYNAMIC_PEOPLE', 'DYNAMIC_ORG', 'string'],
				required: true,
				multiple: true,
			},
			{
				name: 'Polarity',
				id: 'polarity',
				type: ['positive', 'negative', 'neutral'],
				required: true,
				multiple: false,
			},
			{
				name: 'When',
				id: 'when',
				type: 'CUSTOM_DATE',
				required: false,
				multiple: false,
			},
		],
	},
	{
		frameLabel: 'Project',
		frameId: 'project',
		fields: [
			{
				name: 'Name',
				id: 'name',
				type: 'string',
				required: true,
				multiple: false,
			},
			{
				name: 'Leader',
				id: 'leader',
				type: ['DYNAMIC_PEOPLE'],
				required: true,
				multiple: false,
			},
			{
				name: 'Team Members',
				id: 'team',
				type: ['DYNAMIC_PEOPLE'],
				required: false,
				multiple: true,
			},
			{
				name: 'Budget',
				id: 'budget',
				type: 'integer',
				required: false,
				multiple: false,
			},
			{
				name: 'Timeline',
				id: 'timeline',
				type: 'string',
				required: false,
				multiple: false,
			},
		],
	},
];

// Mock dynamic lists (simplified for prototype)
export const dynamicLists = {
	DYNAMIC_PEOPLE: [
		'Sarah Chen',
		'Mark Johnson',
		'Priya Patel',
		'Alex Rodriguez',
		'David Wong',
		'Elena Vasquez',
		'Rajiv Patel',
		'Michelle Kim',
		'Jameson Li',
		'Sabrina Patel',
		'Harriet Song',
	],
	DYNAMIC_ORG: [
		'Bankcorp, Inc',
		'BigCorp',
		'Tech Innovations Ltd',
		'Global Solutions',
		'Data Systems Inc',
	],
};

// Initialize store function
export const initializeStore = (
	setDocuments: (docs: Document[]) => void,
	setKnowledgeUnitSchemas: (schemas: KnowledgeUnitSchema[]) => void
): void => {
	setDocuments(dummyDocuments);
	setKnowledgeUnitSchemas(knowledgeUnitSchemas);
};
