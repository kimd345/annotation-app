import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import useAnnotationStore from '../store/use-annotation-store';

// Reset the store before each test
beforeEach(() => {
	// Clear the store
	const store = useAnnotationStore.getState();
	store.documents = [];
	store.knowledgeUnitSchemas = [];
	store.knowledgeUnits = [];
	store.selectedDocumentId = null;
	store.activeHighlightFieldId = null;
});

describe('Annotation Store', () => {
	test('should select a document', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		store.documents = [testDoc];

		// Act
		store.selectDocument(testDoc.id);

		// Assert
		expect(store.selectedDocumentId).toBe(testDoc.id);
	});

	test('should add a knowledge unit', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		const testSchema = {
			frameLabel: 'Test KU',
			frameId: 'test-ku',
			fields: [
				{
					id: 'field1',
					name: 'Field 1',
					type: 'string',
					required: true,
					multiple: false,
				},
			],
		};

		store.documents = [testDoc];
		store.knowledgeUnitSchemas = [testSchema];
		store.selectedDocumentId = testDoc.id;

		// Act
		store.addKnowledgeUnit(testSchema.frameId);

		// Assert
		expect(store.knowledgeUnits.length).toBe(1);
		expect(store.knowledgeUnits[0].schemaId).toBe(testSchema.frameId);
		expect(store.knowledgeUnits[0].documentId).toBe(testDoc.id);
		expect(store.knowledgeUnits[0].fields.length).toBe(1);
		expect(store.knowledgeUnits[0].fields[0].id).toBe('field1');

		// Check if document is marked as having annotations
		expect(store.documents[0].hasAnnotations).toBe(true);
	});

	test('should update field value', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		const testSchema = {
			frameLabel: 'Test KU',
			frameId: 'test-ku',
			fields: [
				{
					id: 'field1',
					name: 'Field 1',
					type: 'string',
					required: true,
					multiple: false,
				},
			],
		};

		store.documents = [testDoc];
		store.knowledgeUnitSchemas = [testSchema];
		store.selectedDocumentId = testDoc.id;
		store.addKnowledgeUnit(testSchema.frameId);

		const kuId = store.knowledgeUnits[0].id;
		const fieldId = 'field1';
		const testValue = 'Test value';

		// Act
		store.updateFieldValue(kuId, fieldId, testValue);

		// Assert
		expect(store.knowledgeUnits[0].fields[0].value).toBe(testValue);
	});

	test('should add highlight to field', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		const testSchema = {
			frameLabel: 'Test KU',
			frameId: 'test-ku',
			fields: [
				{
					id: 'field1',
					name: 'Field 1',
					type: 'string',
					required: true,
					multiple: false,
				},
			],
		};

		store.documents = [testDoc];
		store.knowledgeUnitSchemas = [testSchema];
		store.selectedDocumentId = testDoc.id;
		store.addKnowledgeUnit(testSchema.frameId);

		const kuId = store.knowledgeUnits[0].id;
		const fieldId = 'field1';

		const testHighlight = {
			startOffset: 0,
			endOffset: 4,
			text: 'Test',
			fieldId: fieldId,
			kuId: kuId,
		};

		// Act
		store.addHighlight(testHighlight);

		// Assert
		expect(store.knowledgeUnits[0].fields[0].highlights.length).toBe(1);
		expect(store.knowledgeUnits[0].fields[0].highlights[0].text).toBe('Test');
	});

	test('should remove highlight from field', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		const testSchema = {
			frameLabel: 'Test KU',
			frameId: 'test-ku',
			fields: [
				{
					id: 'field1',
					name: 'Field 1',
					type: 'string',
					required: true,
					multiple: false,
				},
			],
		};

		store.documents = [testDoc];
		store.knowledgeUnitSchemas = [testSchema];
		store.selectedDocumentId = testDoc.id;
		store.addKnowledgeUnit(testSchema.frameId);

		const kuId = store.knowledgeUnits[0].id;
		const fieldId = 'field1';

		const testHighlight = {
			startOffset: 0,
			endOffset: 4,
			text: 'Test',
			fieldId: fieldId,
			kuId: kuId,
		};

		store.addHighlight(testHighlight);
		const highlightId = store.knowledgeUnits[0].fields[0].highlights[0].id;

		// Act
		store.removeHighlight(highlightId);

		// Assert
		expect(store.knowledgeUnits[0].fields[0].highlights.length).toBe(0);
	});

	test('should export annotations correctly', () => {
		// Arrange
		const store = useAnnotationStore.getState();
		const testDoc = {
			id: 'test-doc',
			title: 'Test Doc',
			content: 'Test content',
			hasAnnotations: false,
		};
		const testSchema = {
			frameLabel: 'Test KU',
			frameId: 'test-ku',
			fields: [
				{
					id: 'field1',
					name: 'Field 1',
					type: 'string',
					required: true,
					multiple: false,
				},
			],
		};

		store.documents = [testDoc];
		store.knowledgeUnitSchemas = [testSchema];
		store.selectedDocumentId = testDoc.id;
		store.addKnowledgeUnit(testSchema.frameId);

		const kuId = store.knowledgeUnits[0].id;
		const fieldId = 'field1';
		const testValue = 'Test value';

		store.updateFieldValue(kuId, fieldId, testValue);

		const testHighlight = {
			startOffset: 0,
			endOffset: 4,
			text: 'Test',
			fieldId: fieldId,
			kuId: kuId,
		};

		store.addHighlight(testHighlight);

		// Act
		const exportedData = store.exportAnnotations();

		// Assert
		expect(exportedData.length).toBe(1);
		expect(exportedData[0].documentId).toBe(testDoc.id);
		expect(exportedData[0].knowledgeUnits.length).toBe(1);
		expect(exportedData[0].knowledgeUnits[0].fields[0].value).toBe(testValue);
		expect(exportedData[0].knowledgeUnits[0].fields[0].highlights.length).toBe(
			1
		);
		expect(exportedData[0].knowledgeUnits[0].fields[0].highlights[0].text).toBe(
			'Test'
		);
	});
});
