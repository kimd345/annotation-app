import { useRef, useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { useHighlighting } from '@/hooks/use-highlighting';
import HighlightedText from '@/components/highlights/HighlightedText';
import HighlightContextMenu from '@/components/highlights/HighlightContextMenu';
import { useDocumentQuery, useDocumentAnnotationsQuery } from '@/hooks/use-api';

const DocumentView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		highlightId: string;
	} | null>(null);

	const {
		selectedDocumentId,
		activeHighlightFieldId,
		hoveredFieldId,
		setHoveredField,
		setKnowledgeUnits,
		removeHighlight,
	} = useAnnotationStore(
		useShallow((state) => ({
			selectedDocumentId: state.selectedDocumentId,
			activeHighlightFieldId: state.activeHighlightFieldId,
			hoveredFieldId: state.hoveredFieldId,
			setHoveredField: state.setHoveredField,
			setKnowledgeUnits: state.setKnowledgeUnits,
			removeHighlight: state.removeHighlight,
		}))
	);

	// Fetch document and annotations
	const {
		data: document,
		isLoading: isLoadingDocument,
		isError: isErrorDocument,
	} = useDocumentQuery(selectedDocumentId);

	const {
		data: annotations,
		isLoading: isLoadingAnnotations,
		isError: isErrorAnnotations,
	} = useDocumentAnnotationsQuery(selectedDocumentId);

	// Update the store with the annotations when they change
	useEffect(() => {
		if (annotations) {
			setKnowledgeUnits(annotations);
		}
	}, [annotations, setKnowledgeUnits]);

	// Use the highlighting hook
	const { handleHighlightClick, debouncedHandleTextSelection } =
		useHighlighting(containerRef);

	// Get all highlights for the selected document
	const getAllHighlights = () => {
		if (!selectedDocumentId || !annotations) return [];

		const highlights: Array<{
			id: string;
			startOffset: number;
			endOffset: number;
			fieldId: string;
			kuId: string;
		}> = [];

		annotations.forEach((ku) => {
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

	// Handle right-click on a highlight to show context menu
	const handleHighlightRightClick = (
		event: React.MouseEvent,
		highlightId: string
	) => {
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX,
			mouseY: event.clientY,
			highlightId: highlightId,
		});
	};

	// Handle closing the context menu
	const handleCloseContextMenu = () => setContextMenu(null);

	// Handle removing a highlight from the context menu
	const handleRemoveHighlight = () => {
		if (contextMenu) {
			removeHighlight(contextMenu.highlightId);
			handleCloseContextMenu();
		}
	};

	// Loading and error states
	const isLoading = isLoadingDocument || isLoadingAnnotations;
	const isError = isErrorDocument || isErrorAnnotations;

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
					{document ? document.title : 'Document View'}
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
					textAlign: 'left',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
				onMouseUp={
					activeHighlightFieldId ? debouncedHandleTextSelection : undefined
				}
			>
				{isLoading ? (
					<CircularProgress />
				) : isError ? (
					<Typography color='error' align='center'>
						Error loading document. Please try again.
					</Typography>
				) : !selectedDocumentId ? (
					<Typography color='text.secondary' align='center'>
						Select a document from the list
					</Typography>
				) : !document ? (
					<Typography color='text.secondary' align='center'>
						Document not found
					</Typography>
				) : (
					<HighlightedText
						content={document.content}
						highlights={getAllHighlights().sort(
							(a, b) => a.startOffset - b.startOffset
						)}
						activeHighlightFieldId={activeHighlightFieldId}
						hoveredFieldId={hoveredFieldId}
						onHighlightClick={handleHighlightClick}
						onHighlightRightClick={handleHighlightRightClick}
						setHoveredField={setHoveredField}
					/>
				)}
			</Box>

			{/* Context Menu for Highlights */}
			<HighlightContextMenu
				contextMenu={contextMenu}
				onClose={handleCloseContextMenu}
				onRemoveHighlight={handleRemoveHighlight}
			/>
		</Paper>
	);
};

export default DocumentView;
