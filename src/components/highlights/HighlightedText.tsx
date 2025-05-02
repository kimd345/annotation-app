import React, { ReactElement } from 'react';
import { getColorForField } from '@/utils/format';

interface HighlightedTextProps {
  content: string;
  highlights: Array<{
    id: string;
    startOffset: number;
    endOffset: number;
    fieldId: string;
    kuId: string;
  }>;
  activeHighlightFieldId: string | null;
  hoveredFieldId: string | null;
  onHighlightClick: (highlightId: string) => void;
  onHighlightRightClick: (e: React.MouseEvent, highlightId: string) => void;
  setHoveredField: (fieldId: string | null) => void;
}

export const HighlightedText = ({
  content,
  highlights,
  activeHighlightFieldId,
  hoveredFieldId,
  onHighlightClick,
  onHighlightRightClick,
  setHoveredField,
}: HighlightedTextProps) => {
  // If no highlights, return plain text
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
      // TODO: handle overlapping highlights
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
        onClick={() => onHighlightClick(highlight.id)}
        onContextMenu={(e) => onHighlightRightClick(e, highlight.id)}
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
      <span key="text-last">{content.substring(lastIndex)}</span>
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

export default HighlightedText;