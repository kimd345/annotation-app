import React, { useState, useRef, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import useAnnotationStore from '../../store/use-annotation-store';
import { useShallow } from 'zustand/shallow';

// Generate a color based on field ID (simplified version)
const getColorForField = (fieldId: string) => {
	// Simple hash function to generate a color
	const hash = fieldId.split('').reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);

	const h = Math.abs(hash) % 360;
	return `hsl(${h}, 70%, 80%)`;
};

const DocumentView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);

	const {
		selectedDocumentId,
		documents,
		knowledgeUnits,
		activeHighlightFieldId,
		setActiveHighlightField,
		addHighlight,
	} = useAnnotationStore(useShallow((state) => ({
		selectedDocumentId: state.selectedDocumentId,
		documents: state.documents,
		knowledgeUnits: state.knowledgeUnits,
		activeHighlightFieldId: state.activeHighlightFieldId,
		setActiveHighlightField: state.setActiveHighlightField,
		addHighlight: state.addHighlight,
	})));

	// Find the selected document
	const selectedDocument = documents.find(
		(doc) => doc.id === selectedDocumentId
	);

	// Get all highlights for the selected document
	const getAllHighlights = () => {
		if (!selectedDocumentId) return [];

		const docKUs = knowledgeUnits.filter(
			(ku) => ku.documentId === selectedDocumentId
		);

		const highlights: Array<{
			id: string;
			startOffset: number;
			endOffset: number;
			fieldId: string;
			kuId: string;
		}> = [];

		docKUs.forEach((ku) => {
			ku.fields.forEach((field) => {
				field.highlights.forEach((highlight) => {
					highlights.push({
						id: highlight.id,
						startOffset: highlight.startOffset,
						endOffset: highlight.endOffset,
						fieldId: field.id,
						kuId: ku.id,
					});
				});
			});
		});

		return highlights;
	};

	// Handle text selection for highlighting
	const handleTextSelection = () => {
		if (!activeHighlightFieldId || !selectedDocumentId) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
			return;

		const range = selection.getRangeAt(0);
		const container = containerRef.current;
		if (!container) return;

		// Find the active KU that contains the active field
		const activeKU = knowledgeUnits.find(
			(ku) =>
				ku.documentId === selectedDocumentId &&
				ku.fields.some((field) => field.id === activeHighlightFieldId)
		);

		if (!activeKU) return;

		// Calculate text offsets
		const documentText = selectedDocument?.content || '';
		const startContainer = range.startContainer;
		const startOffset = getTextOffset(
			container,
			startContainer,
			range.startOffset
		);
		const endOffset = startOffset + range.toString().length;

		// Add the highlight
		addHighlight({
			startOffset,
			endOffset,
			text: range.toString(),
			fieldId: activeHighlightFieldId,
			kuId: activeKU.id,
		});

		// Clear the selection
		selection.removeAllRanges();
	};

	// Helper function to calculate text offset within the document
	const getTextOffset = (
		rootNode: Node,
		targetNode: Node,
		targetOffset: number
	): number => {
		if (!rootNode.firstChild) return 0;

		let offset = 0;
		const walker = document.createTreeWalker(
			rootNode,
			NodeFilter.SHOW_TEXT,
			null
		);

		let currentNode = walker.nextNode();
		while (currentNode) {
			if (currentNode === targetNode) {
				return offset + targetOffset;
			}

			offset += currentNode.textContent?.length || 0;
			currentNode = walker.nextNode();
		}

		return offset;
	};

	// Render document with highlights
	const renderDocumentWithHighlights = () => {
		if (!selectedDocument) return null;

		const { content } = selectedDocument;
		const highlights = getAllHighlights().sort(
			(a, b) => a.startOffset - b.startOffset
		);

		if (highlights.length === 0) {
			return <pre>{content}</pre>;
		}

		// Create segments with highlights
		const segments: JSX.Element[] = [];
		let lastIndex = 0;

		highlights.forEach((highlight, index) => {
			// Add text before the highlight
			if (highlight.startOffset > lastIndex) {
				segments.push(
					<span key={`text-${index}`}>
						{content.substring(lastIndex, highlight.startOffset)}
					</span>
				);
			}

			// Add the highlighted text
			const isActiveHighlight = activeHighlightFieldId === highlight.fieldId;
			const highlightColor = getColorForField(highlight.fieldId);

			segments.push(
				<span
					key={`highlight-${highlight.id}`}
					style={{
						backgroundColor: isActiveHighlight
							? highlightColor
							: 'rgba(200, 200, 200, 0.3)',
						cursor: 'pointer',
					}}
					onClick={() => setActiveHighlightField(highlight.fieldId)}
				>
					{content.substring(highlight.startOffset, highlight.endOffset)}
				</span>
			);

			lastIndex = highlight.endOffset;
		});

		// Add remaining text
		if (lastIndex < content.length) {
			segments.push(
				<span key='text-last'>{content.substring(lastIndex)}</span>
			);
		}

		return <pre>{segments}</pre>;
	};

	return (
		<Paper
			elevation={0}
			variant='outlined'
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
				<Typography variant='h6'>
					{selectedDocument ? selectedDocument.title : 'Document View'}
				</Typography>
				{activeHighlightFieldId && (
					<Typography variant='caption' color='primary'>
						Highlight mode active - Select text to highlight
					</Typography>
				)}
			</Box>

			<Box
				ref={containerRef}
				sx={{
					flexGrow: 1,
					overflow: 'auto',
					p: 2,
					fontFamily: 'monospace',
					fontSize: '14px',
					lineHeight: 1.5,
					whiteSpace: 'pre-wrap',
					cursor: activeHighlightFieldId ? 'cell' : 'text',
				}}
				onMouseUp={activeHighlightFieldId ? handleTextSelection : undefined}
			>
				{!selectedDocument && (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						Select a document from the list
					</Typography>
				)}

				{selectedDocument && renderDocumentWithHighlights()}
			</Box>
		</Paper>
	);
};

export default DocumentView;
