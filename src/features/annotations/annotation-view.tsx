import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Menu,
	MenuItem,
	Paper,
	Divider,
	CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAnnotationStore from '@/store/use-annotation-store';
import KnowledgeUnitForm from './ku-form';
import ValidationExport from './validation-export';
import { useShallow } from 'zustand/shallow';
import {
	useSchemasQuery,
	useDocumentAnnotationsQuery,
	useKnowledgeUnitMutation,
} from '@/hooks/use-api';

const AnnotationView = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const { selectedDocumentId, setKnowledgeUnitSchemas, addKnowledgeUnit } =
		useAnnotationStore(
			useShallow((state) => ({
				selectedDocumentId: state.selectedDocumentId,
				setKnowledgeUnitSchemas: state.setKnowledgeUnitSchemas,
				addKnowledgeUnit: state.addKnowledgeUnit,
			}))
		);

	// Fetch schemas and annotations
	const {
		data: schemas,
		isLoading: isLoadingSchemas,
		isError: isErrorSchemas,
	} = useSchemasQuery();
	const {
		data: annotations,
		isLoading: isLoadingAnnotations,
		isError: isErrorAnnotations,
	} = useDocumentAnnotationsQuery(selectedDocumentId);

	// Mutation for adding new KUs
	const addKUMutation = useKnowledgeUnitMutation();

	// Update the store with the schemas when they change
	useEffect(() => {
		if (schemas) {
			setKnowledgeUnitSchemas(schemas);
		}
	}, [schemas, setKnowledgeUnitSchemas]);

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
		// Create the new KU locally
		const newKU = addKnowledgeUnit(schemaId);
		if (newKU) {
			// Save it to the API
			addKUMutation.mutate(newKU);
		}
		handleCloseMenu();
	};

	// Loading and error states
	const isLoading = isLoadingSchemas || isLoadingAnnotations;
	const isError = isErrorSchemas || isErrorAnnotations;

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
				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress />
					</Box>
				) : isError ? (
					<Typography color='error' align='center' sx={{ py: 4 }}>
						Error loading data. Please try again.
					</Typography>
				) : !selectedDocumentId ? (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						Select a document to add annotations
					</Typography>
				) : annotations && annotations.length === 0 ? (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						No knowledge units added yet
					</Typography>
				) : annotations && annotations.length > 0 ? (
					<Box>
						{annotations.map((ku) => (
							<KnowledgeUnitForm
								key={ku.id}
								kuId={ku.id}
								schemaId={ku.schemaId}
							/>
						))}
					</Box>
				) : null}
			</Box>

			<Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					fullWidth
					onClick={handleOpenMenu}
					disabled={!selectedDocumentId || !schemas}
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
					{schemas &&
						schemas.map((schema) => (
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
