// src/features/annotations/annotation-pane.tsx
import React, { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Menu,
	MenuItem,
	Paper,
	Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAnnotationStore from '@/store/use-annotation-store';
import KnowledgeUnitForm from './ku-form';
import ValidationExport from './validation-export';
import { useShallow } from 'zustand/shallow';

const AnnotationView = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const {
		selectedDocumentId,
		knowledgeUnitSchemas,
		knowledgeUnits,
		addKnowledgeUnit,
	} = useAnnotationStore(
		useShallow((state) => ({
			selectedDocumentId: state.selectedDocumentId,
			knowledgeUnitSchemas: state.knowledgeUnitSchemas,
			knowledgeUnits: state.knowledgeUnits,
			addKnowledgeUnit: state.addKnowledgeUnit,
		}))
	);

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
						{documentKUs.map((ku) => (
							<KnowledgeUnitForm
							// @ts-ignore
								key={ku.id}
								kuId={ku.id}
								schemaId={ku.schemaId}
							/>
						))}
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
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
				>
					{knowledgeUnitSchemas.map((schema) => (
						<MenuItem
							key={schema.frameId}
							onClick={() => handleAddKU(schema.frameId)}
							sx={{ width: 285 }}
						>
							{schema.frameLabel}
						</MenuItem>
					))}
				</Menu>

				<Divider sx={{ my: 2 }} />

				{/* Replace the old Export button with the new ValidationExport component */}
				<ValidationExport documentId={selectedDocumentId} />
			</Box>
		</Paper>
	);
};

export default AnnotationView;
