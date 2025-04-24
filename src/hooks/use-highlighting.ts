import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import debounce from 'lodash/debounce';
import useAnnotationStore from '@/store/use-annotation-store';

export const useHighlighting = (containerRef: React.RefObject<HTMLElement>) => {
  const {
    selectedDocumentId,
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

  // Function to scroll to a field in the annotation pane
  const scrollToField = (fieldId: string): void => {
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
  const handleHighlightClick = (highlightId: string): void => {
    const highlightData = findFieldByHighlightId(highlightId);
    if (highlightData) {
      // Set active highlight field
      setActiveHighlightField(highlightData.fieldId);

      // Scroll to and focus the field
      scrollToField(highlightData.fieldId);
    }
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
    }, 300),
    [
      activeHighlightFieldId,
      selectedDocumentId,
      knowledgeUnits,
      containerRef,
      addHighlight,
      findFieldByHighlightId,
    ]
  );

  // Add useEffect to prevent double-click selection issues
  useEffect(() => {
    // Function to prevent text selection on double-click
    const preventDoubleClickSelection = (event: MouseEvent): void => {
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
  }, [activeHighlightFieldId, containerRef]);

  return {
    activeHighlightFieldId,
    hoveredFieldId,
    setHoveredField,
    debouncedHandleTextSelection,
    handleHighlightClick,
    getTextOffset,
    removeHighlight,
  };
};