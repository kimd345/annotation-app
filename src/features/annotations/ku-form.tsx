import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Paper, Typography, Box, Menu, MenuItem } from '@mui/material';
import { useShallow } from 'zustand/shallow';
import debounce from 'lodash/debounce';
import useAnnotationStore from '@/store/use-annotation-store';
import { getColorForField } from '@/utils/format';

const DocumentView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		highlightId: string;
	} | null>(null);

	const {
		selectedDocumentId,
		documents,
		knowledgeUnits,
		activeHighlightFieldId,
		hoveredFieldId,
		addHighlight,
		setActiveHighlightField,
		setHoveredField,
		findFieldByHighlightId,
		removeHighlight,
	} = useAnnotationStore(
		useShallow((state) => ({
			selectedDocumentId: state.selectedDocumentId,
			documents: state.documents,
			knowledgeUnits: state.knowledgeUnits,
			activeHighlightFieldId: state.activeHighlightFieldId,
			hoveredFieldId: state.hoveredFieldId,
			addHighlight: state.addHighlight,
			setActiveHighlightField: state.setActiveHighlightField,
			setHoveredField: state.setHoveredField,
			findFieldByHighlightId: state.findFieldByHighlightId,
			removeHighlight: state.removeHighlight,
		}))
	);

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

	// Function to scroll to a field in the annotation pane
	const scrollToField = (fieldId: string) => {
		// Find the field element by id
		const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
		if (fieldElement) {
			// Scroll the field into view with a smooth animation
			fieldElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	};

	// Handle clicking on a highlight
	const handleHighlightClick = (highlightId: string) => {
		const highlightData = findFieldByHighlightId(highlightId);
		if (highlightData) {
			// Set active highlight field
			setActiveHighlightField(highlightData.fieldId); // Field's id

			// Scroll to and focus the field
			scrollToField(highlightData.fieldId);
		}
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
	const handleCloseContextMenu = () => {
		setContextMenu(null);
	};

	// Handle removing a highlight from the context menu
	// Updated to first close the menu, then remove the highlight to prevent focus issues
	const handleRemoveHighlight = () => {
		if (contextMenu) {
			const highlightId = contextMenu.highlightId;
			handleCloseContextMenu(); // Close menu first

			// Small delay to ensure menu is closed before removing highlight
			setTimeout(() => {
				removeHighlight(highlightId);
			}, 10);
		}
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
			return (
				<pre
					style={{
						whiteSpace: 'pre-wrap',
						wordWrap: 'break-word',
						width: '100%',
					}}
				>
					{content}
				</pre>
			);
		}

		// First, validate that highlights don't overlap
		// This prevents issues with overlapping/nested highlights
		for (let i = 0; i < highlights.length - 1; i++) {
			const current = highlights[i];
			const next = highlights[i + 1];

			if (current.endOffset > next.startOffset) {
				console.warn('Overlapping highlights detected:', current, next);
				// You may want to handle overlapping highlights here
				// For now, we'll continue but it's something to address
			}
		}

		// Create segments with highlights
		const segments: ReactElement[] = [];
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

			// Determine highlight display state
			const isActiveHighlight = activeHighlightFieldId === highlight.fieldId;
			const isHoveredHighlight = hoveredFieldId === highlight.fieldId;
			const highlightColor = getColorForField(highlight.fieldId);

			// Style based on state (active/hovered/normal)
			let backgroundColor = 'rgba(200, 200, 200, 0.3)'; // Default color
			let opacity = 0.7;

			if (isActiveHighlight) {
				backgroundColor = highlightColor;
				opacity = 0.8;
			} else if (isHoveredHighlight) {
				backgroundColor = highlightColor;
				opacity = 0.5;
			}

			// Add the highlighted text
			segments.push(
				<span
					key={`highlight-${highlight.id}`}
					data-highlight-id={highlight.id}
					style={{
						backgroundColor,
						opacity,
						cursor: 'pointer',
						padding: '2px 0',
						borderRadius: '2px',
						transition: 'all 0.2s ease',
					}}
					onClick={() => handleHighlightClick(highlight.id)}
					onContextMenu={(e) => handleHighlightRightClick(e, highlight.id)}
					onMouseEnter={() => setHoveredField(highlight.fieldId)}
					onMouseLeave={() => setHoveredField(null)}
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

		return (
			<pre
				style={{
					whiteSpace: 'pre-wrap',
					wordWrap: 'break-word',
					width: '100%',
				}}
			>
				{segments}
			</pre>
		);
	};

	// Create a debounced version of handleTextSelection
	const debouncedHandleTextSelection = useCallback(
		debounce(() => {
			if (!activeHighlightFieldId || !selectedDocumentId) return;

			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
				return;

			const range = selection.getRangeAt(0);
			const container = containerRef.current;
			if (!container) return;

			// Check if the selection overlaps with existing highlights
			const highlightElements = container.querySelectorAll(
				'[data-highlight-id]'
			);
			let overlapsHighlight = false;

			// Convert range to DOM range for comparison
			const selectionRect = range.getBoundingClientRect();

			highlightElements.forEach((el) => {
				const elRect = el.getBoundingClientRect();

				// Check for overlap between selection and highlight
				if (
					!(
						selectionRect.right < elRect.left ||
						selectionRect.left > elRect.right ||
						selectionRect.bottom < elRect.top ||
						selectionRect.top > elRect.bottom
					)
				) {
					overlapsHighlight = true;
				}
			});

			if (overlapsHighlight) {
				// Don't proceed with highlighting if overlapping
				selection.removeAllRanges();
				return;
			}

			// Find the active KU that contains the active field
			const activeKU = knowledgeUnits.find(
				(ku) =>
					ku.documentId === selectedDocumentId &&
					ku.fields.some((field) => field.id === activeHighlightFieldId)
			);

			if (!activeKU) return;

			// Calculate text offsets
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
		}, 300), // 300ms debounce time
		[
			activeHighlightFieldId,
			selectedDocumentId,
			knowledgeUnits,
			getTextOffset,
			addHighlight,
		]
	);

	// Add useEffect to prevent double-click selection issues
	useEffect(() => {
		// Function to prevent text selection on double-click
		const preventDoubleClickSelection = (event: MouseEvent) => {
			// Check if we're in highlight mode and if the target is a highlight
			if (
				activeHighlightFieldId &&
				(event.target as HTMLElement).hasAttribute('data-highlight-id')
			) {
				event.preventDefault();
			}
		};

		// Add event listener for double-click
		const container = containerRef.current;
		if (container) {
			container.addEventListener('dblclick', preventDoubleClickSelection);
		}

		// Clean up
		return () => {
			if (container) {
				container.removeEventListener('dblclick', preventDoubleClickSelection);
			}
		};
	}, [activeHighlightFieldId, containerRef.current]);

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
					textAlign: 'left',
				}}
				onMouseUp={
					activeHighlightFieldId ? debouncedHandleTextSelection : undefined
				}
			>
				{!selectedDocument && (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						Select a document from the list
					</Typography>
				)}

				{selectedDocument && renderDocumentWithHighlights()}
			</Box>

			{/* Context Menu for Highlights with updated prop */}
			<Menu
				open={contextMenu !== null}
				onClose={handleCloseContextMenu}
				anchorReference='anchorPosition'
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				// Add these properties to fix accessibility issues
				disableRestoreFocus
				disablePortal
				keepMounted={false}
			>
				<MenuItem
					onClick={handleRemoveHighlight}
					// Add this to ensure focus is properly managed
					dense
				>
					Remove Highlight
				</MenuItem>
			</Menu>
		</Paper>
	);
};

export default DocumentView;
