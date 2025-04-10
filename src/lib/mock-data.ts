import { Document, KnowledgeUnitSchema } from '../types';

// Sample documents
export const dummyDocuments: Document[] = [
	{
		id: 'doc-1',
		title: 'Email: Talent Acquisition Strategies',
		content: `From: Jameson Li <jli.capital@bigcorp.com>
To: Sabrina Patel <spatel@bigcorp.com>
CC: Harriet Song
Subject: Re: Fwd: Enhancing Talent Acquisition Strategies

Dear Sabrina,

Thank you for your email and for including me in this key initiative. 
I appreciate being asked to provide input on our new approach to talent acquisition strategies.

Looking forward to participating in the meeting next week to finalize these strategies.

Best regards,
Jameson
CFO
Bankcorp, Inc`,
		hasAnnotations: false,
	},
	{
		id: 'doc-2',
		title: 'Project Proposal: Data Analytics',
		content: `Project Name: Enterprise Data Analytics Platform
Lead: Sarah Chen
Department: Business Intelligence
Proposed Budget: $450,000
Timeline: 6 months

Project Overview:
This proposal outlines the development of a centralized data analytics platform to enhance our decision-making capabilities across all departments.

Key Benefits:
- Real-time access to business metrics
- Automated reporting and dashboard generation
- Advanced predictive analytics capabilities
- Integration with existing data sources

Implementation Team:
- Sarah Chen (Lead Data Scientist)
- Mark Johnson (Backend Engineer)
- Priya Patel (Frontend Developer)
- Alex Rodriguez (Database Administrator)`,
		hasAnnotations: false,
	},
	{
		id: 'doc-3',
		title: 'Meeting Minutes: Q2 Planning',
		content: `Q2 Planning Meeting - April 5, 2025
Attendees: David Wong (CEO), Elena Vasquez (COO), Rajiv Patel (CTO), Michelle Kim (CMO)

Agenda Items:
1. Q1 Performance Review
2. Q2 Strategic Priorities
3. Budget Allocations
4. New Product Launch Timeline

Key Decisions:
- Approved $2.5M budget for marketing campaign
- Delayed Alpha product launch to July 15th
- Authorized hiring of 5 new engineers for the backend team
- Approved office expansion plan for Toronto location`,
		hasAnnotations: false,
	},
];

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
