import { Badge, IconButton, Tooltip } from '@mui/material';
import HighlightIcon from '@mui/icons-material/Highlight';
import ClearIcon from '@mui/icons-material/Clear';
import { getColorForField } from '@/utils/format';

interface HighlightButtonProps {
  fieldId: string;
  isActive: boolean;
  hasHighlights: boolean;
  highlightCount: number;
  hasHighlightError: boolean;
  onHighlightClick: () => void;
  onClearAllHighlights: () => void;
}

export const HighlightButton = ({
  fieldId,
  isActive,
  hasHighlights,
  highlightCount,
  hasHighlightError,
  onHighlightClick,
  onClearAllHighlights,
}: HighlightButtonProps) => {
  const getFieldColor = () => getColorForField(fieldId);

  return (
    <>
      {/* Highlight button with badge showing count */}
      <Badge
        badgeContent={highlightCount}
        color={hasHighlightError ? 'error' : 'primary'}
        invisible={!hasHighlights}
        sx={{ mx: 1 }}
      >
        <IconButton
          sx={{
            // Updated styling - show error state
            borderColor: hasHighlightError
              ? 'error.main'
              : isActive
              ? getFieldColor()
              : 'transparent',
            borderWidth: isActive || hasHighlightError ? 1 : 0,
            borderStyle: 'solid',
            // Handle icon color based on highlights
            color: hasHighlightError
              ? 'error.main'
              : hasHighlights
              ? getFieldColor()
              : 'action.disabled',
            // Remove focus outline/border
            '&:focus': {
              outline: 'none',
            },
            '&.Mui-focusVisible': {
              outline: 'none',
              border: 'none',
            },
          }}
          onClick={onHighlightClick}
          aria-label="Highlight evidence"
        >
          <HighlightIcon />
        </IconButton>
      </Badge>

      {/* Clear all highlights button - only visible when highlights exist */}
      {hasHighlights && (
        <Tooltip title="Clear all highlights">
          <IconButton
            size="small"
            onClick={onClearAllHighlights}
            color="default"
            sx={{ mr: 1 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default HighlightButton;