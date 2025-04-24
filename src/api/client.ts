import axios from 'axios';
import {
	Document,
	KnowledgeUnit,
	KnowledgeUnitSchema,
	CustomFieldType,
} from '../types';

const API_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Documents API
export const getDocuments = async (page = 0, limit = 10) => {
	const response = await apiClient.get(
		`/documents?page=${page}&limit=${limit}`
	);
	return response.data;
};

export const getDocumentById = async (id: string) => {
	const response = await apiClient.get(`/documents/${id}`);
	return response.data as Document;
};

// Schemas API
export const getSchemas = async () => {
	const response = await apiClient.get('/schemas');
	return response.data as KnowledgeUnitSchema[];
};

export const getCustomFieldTypes = async () => {
	const response = await apiClient.get('/schemas/custom-fields');
	return response.data as CustomFieldType[];
};

// Lists API
export const getListTypes = async () => {
	const response = await apiClient.get('/lists/types');
	return response.data as string[];
};

export const getListItems = async (
	listType: string,
	search = '',
	page = 0,
	limit = 50
) => {
	const response = await apiClient.get(
		`/lists/${listType}?search=${search}&page=${page}&limit=${limit}`
	);
	return response.data;
};

// Annotations API
export const getDocumentAnnotations = async (documentId: string) => {
	const response = await apiClient.get(`/annotations/document/${documentId}`);
	return response.data as KnowledgeUnit[];
};

export const saveKnowledgeUnit = async (knowledgeUnit: KnowledgeUnit) => {
	const response = await apiClient.post('/annotations', knowledgeUnit);
	return response.data as KnowledgeUnit;
};

export const updateKnowledgeUnit = async (knowledgeUnit: KnowledgeUnit) => {
	const response = await apiClient.put(
		`/annotations/${knowledgeUnit.id}`,
		knowledgeUnit
	);
	return response.data as KnowledgeUnit;
};

export const deleteKnowledgeUnit = async (id: string) => {
	await apiClient.delete(`/annotations/${id}`);
	return id;
};

export const exportDocumentAnnotations = async (documentId: string) => {
	const response = await apiClient.get(`/annotations/export/${documentId}`);
	return response.data;
};

export default apiClient;
