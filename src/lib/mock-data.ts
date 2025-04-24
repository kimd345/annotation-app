import { v4 as uuidv4 } from 'uuid';

import { Document, KnowledgeUnitSchema, CustomFieldType } from '../types';
import useAnnotationStore from '@/store/use-annotation-store';


const txtFilesModules = import.meta.glob('./txt/*.txt', {
	eager: true,
	as: 'raw',
});

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
				type: 'CUSTOM_DATE', // Changed to use custom date type
				required: false,
				multiple: false,
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
			{
				name: 'Location',
				id: 'location',
				type: 'CUSTOM_LOCATION', // Added custom location type
				required: false,
				multiple: false,
			}
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
			{
				name: 'Start Date',
				id: 'startDate',
				type: 'CUSTOM_DATE', // Added custom date type
				required: false, 
				multiple: false
			},
			{
				name: 'End Date',
				id: 'endDate',
				type: 'CUSTOM_DATE', // Added custom date type
				required: false,
				multiple: false
			},
		],
	},
];

// Sample custom field types
export const customFieldTypes: CustomFieldType[] = [
	{
		typeId: 'CUSTOM_DATE',
		typeLabel: 'Date',
		fields: [
			{
				id: 'month',
				name: 'Month',
				type: [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December',
				],
				required: false,
			},
			{
				id: 'day',
				name: 'Day',
				type: [
					'1',
					'2',
					'3',
					'4',
					'5',
					'6',
					'7',
					'8',
					'9',
					'10',
					'11',
					'12',
					'13',
					'14',
					'15',
					'16',
					'17',
					'18',
					'19',
					'20',
					'21',
					'22',
					'23',
					'24',
					'25',
					'26',
					'27',
					'28',
					'29',
					'30',
					'31',
				],
				required: false,
			},
			{
				id: 'year',
				name: 'Year',
				type: 'integer',
				required: false,
			},
		],
	},
	{
		typeId: 'CUSTOM_LOCATION',
		typeLabel: 'Location',
		fields: [
			{
				id: 'country',
				name: 'Country',
				type: 'DYNAMIC_COUNTRIES',
				required: true,
			},
			{
				id: 'city',
				name: 'City',
				type: 'string',
				required: false,
			},
			{
				id: 'address',
				name: 'Address',
				type: 'string',
				required: false,
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
	DYNAMIC_COUNTRIES: [
		'United States',
		'Canada',
		'United Kingdom',
		'France',
		'Germany',
		'Japan',
		'China',
		'India',
		'Australia',
		'Brazil',
		'Mexico',
		'South Africa',
		'Russia',
		'Italy',
		'Spain',
	],
};


// Initialize store function
export const initializeStore = (
	// setDocuments: (docs: Document[]) => void,
	// setKnowledgeUnitSchemas: (schemas: KnowledgeUnitSchema[]) => void
): void => {
	// Use the store's actions to set the data
	const store = useAnnotationStore.getState();
	
	// Set documents
	store.documents = dummyDocuments;
	
	// Set schemas
	store.knowledgeUnitSchemas = knowledgeUnitSchemas;
	
	// Set custom field types
	store.customFieldTypes = customFieldTypes;
};
