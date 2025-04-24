import { Menu, MenuItem } from '@mui/material';

interface HighlightContextMenuProps {
  contextMenu: {
    mouseX: number;
    mouseY: number;
    highlightId: string;
  } | null;
  onClose: () => void;
  onRemoveHighlight: () => void;
}

export const HighlightContextMenu = ({
  contextMenu,
  onClose,
  onRemoveHighlight,
}: HighlightContextMenuProps) => {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
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
        onClick={onRemoveHighlight}
        dense // Add this to ensure focus is properly managed
      >
        Remove Highlight
      </MenuItem>
    </Menu>
  );
};

export default HighlightContextMenu;