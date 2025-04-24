import {
	useQuery,
	useMutation,
	useQueryClient,
	UseQueryResult,
} from '@tanstack/react-query';
import * as api from '../api/client';
import {
	KnowledgeUnit,
	Document,
	KnowledgeUnitSchema,
	CustomFieldType,
} from '../types';

// Document queries
export const useDocumentsQuery = (
	page = 0,
	limit = 10
): UseQueryResult<{
	documents: Document[];
	metadata: {
		total: number;
		page: number;
		limit: number;
		hasMore: boolean;
	};
}> => {
	return useQuery({
		queryKey: ['documents', page, limit],
		queryFn: () => api.getDocuments(page, limit),
		keepPreviousData: true,
	});
};

export const useDocumentQuery = (id: string | null) => {
	return useQuery({
		queryKey: ['document', id],
		queryFn: () => api.getDocumentById(id!),
		enabled: !!id,
	});
};

// Schema queries
export const useSchemasQuery = () => {
	return useQuery({
		queryKey: ['schemas'],
		queryFn: api.getSchemas,
		staleTime: Infinity, // Schemas don't change often
	});
};

export const useCustomFieldTypesQuery = () => {
	return useQuery({
		queryKey: ['customFieldTypes'],
		queryFn: api.getCustomFieldTypes,
		staleTime: Infinity,
	});
};

// List queries
export const useListItemsQuery = (
	listType: string,
	search = '',
	page = 0,
	limit = 50
) => {
	return useQuery({
		queryKey: ['list', listType, search, page, limit],
		queryFn: () => api.getListItems(listType, search, page, limit),
		keepPreviousData: true,
		enabled: !!listType,
	});
};

// Annotation queries
export const useDocumentAnnotationsQuery = (documentId: string | null) => {
	return useQuery({
		queryKey: ['annotations', documentId],
		queryFn: () => api.getDocumentAnnotations(documentId!),
		enabled: !!documentId,
	});
};

// Annotation mutations
export const useKnowledgeUnitMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (knowledgeUnit: KnowledgeUnit) => {
			return knowledgeUnit.id
				? api.updateKnowledgeUnit(knowledgeUnit)
				: api.saveKnowledgeUnit(knowledgeUnit);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['annotations', data.documentId],
			});
			queryClient.invalidateQueries({ queryKey: ['documents'] }); // Update document list to reflect annotation status
		},
	});
};

export const useDeleteKnowledgeUnitMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => api.deleteKnowledgeUnit(id),
		onSuccess: (_) => {
			// Since we don't know the documentId here, we need to invalidate all annotation queries
			queryClient.invalidateQueries({ queryKey: ['annotations'] });
			queryClient.invalidateQueries({ queryKey: ['documents'] });
		},
	});
};

export const useExportAnnotationsMutation = () => {
	return useMutation({
		mutationFn: (documentId: string) =>
			api.exportDocumentAnnotations(documentId),
	});
};
