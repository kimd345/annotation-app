import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Menu, 
  MenuItem, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAnnotationStore from '../../store/use-annotation-store';
import KnowledgeUnitForm from './ku-form';
import { useShallow } from 'zustand/shallow';

const AnnotationPanel = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const {
		selectedDocumentId,
		knowledgeUnitSchemas,
		knowledgeUnits,
		addKnowledgeUnit,
	} = useAnnotationStore(useShallow((state) => ({
		selectedDocumentId: state.selectedDocumentId,
		knowledgeUnitSchemas: state.knowledgeUnitSchemas,
		knowledgeUnits: state.knowledgeUnits,
		addKnowledgeUnit: state.addKnowledgeUnit,
	})));

	// Handle opening KU type menu
	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	// Handle closing KU type menu
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	// Handle adding a new KU
	const handleAddKU = (schemaId: string) => {
		addKnowledgeUnit(schemaId);
		console.log('After addKnowledgeUnit:', useAnnotationStore.getState());
		handleCloseMenu();
	};

	// Get KUs for the selected document
	const documentKUs = knowledgeUnits.filter(
		(ku) => ku.documentId === selectedDocumentId
	);

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
				<Typography variant='h6' gutterBottom>
					Knowledge Units
				</Typography>
			</Box>

			<Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
				{!selectedDocumentId && (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						Select a document to add annotations
					</Typography>
				)}

				{selectedDocumentId && documentKUs.length === 0 && (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						No knowledge units added yet
					</Typography>
				)}

				{selectedDocumentId && documentKUs.length > 0 && (
					<Box>
						{documentKUs.map((ku) => {
							const schema = knowledgeUnitSchemas.find(
								(s) => s.frameId === ku.schemaId
							);
							return (
								<KnowledgeUnitForm
									key={ku.id}
									kuId={ku.id}
									schemaId={ku.schemaId}
								/>
							);
						})}
					</Box>
				)}
			</Box>

			<Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					fullWidth
					onClick={handleOpenMenu}
					disabled={!selectedDocumentId}
				>
					Add Knowledge Unit
				</Button>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleCloseMenu}
				>
					{knowledgeUnitSchemas.map((schema) => (
						<MenuItem
							key={schema.frameId}
							onClick={() => handleAddKU(schema.frameId)}
						>
							{schema.frameLabel}
						</MenuItem>
					))}
				</Menu>

				{/* Export button */}
				<Button
					variant='outlined'
					fullWidth
					sx={{ mt: 1 }}
					disabled={!selectedDocumentId || documentKUs.length === 0}
					onClick={() => {
						const exportedData = useAnnotationStore
							.getState()
							.exportAnnotations();
						console.log('Exported annotations:', exportedData);
						// In a real app, you would save this to a file or send to server
						alert('Annotations exported to console');
					}}
				>
					Export Annotations
				</Button>
			</Box>
		</Paper>
	);
};

export default AnnotationPanel;