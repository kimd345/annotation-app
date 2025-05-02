// src/features/annotations/validation-export.tsx
import { useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
	Typography,
	Alert,
	CircularProgress,
	Divider,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { validateKnowledgeUnit } from '@/utils/validation';

const ValidationExport = ({ documentId }: { documentId: string | null }) => {
	const { knowledgeUnits, knowledgeUnitSchemas, documents } =
		useAnnotationStore(
			useShallow((state) => ({
				knowledgeUnits: state.knowledgeUnits,
				knowledgeUnitSchemas: state.knowledgeUnitSchemas,
				documents: state.documents,
			}))
		);

	// State for validation dialog
	const [validationOpen, setValidationOpen] = useState(false);
	const [validationResults, setValidationResults] = useState<{
		isValid: boolean;
		errors: Record<
			string,
			{ kuId: string; kuType: string; fieldErrors: Record<string, string[]> }
		>;
	}>({ isValid: true, errors: {} });
	const [isValidating, setIsValidating] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	// Get knowledge units for the current document
	const documentKUs = documentId
		? knowledgeUnits.filter((ku) => ku.documentId === documentId)
		: [];

	// Find document name
	const document = documents.find((doc) => doc.id === documentId);
	const documentName = document ? document.title : 'Unknown Document';

	// Validate all KUs in the document
	const validateDocument = () => {
		setIsValidating(true);

		// Validation results
		const errors: Record<
			string,
			{
				kuId: string;
				kuType: string;
				fieldErrors: Record<string, string[]>;
			}
		> = {};

		// Run validation for each KU
		documentKUs.forEach((ku) => {
			const schema = knowledgeUnitSchemas.find(
				(s) => s.frameId === ku.schemaId
			);
			if (!schema) {
				errors[ku.id] = {
					kuId: ku.id,
					kuType: 'Unknown',
					fieldErrors: { _schema: ['Schema not found'] },
				};
				return;
			}

			const validation = validateKnowledgeUnit(ku, schema);

			if (!validation.isValid) {
				errors[ku.id] = {
					kuId: ku.id,
					kuType: schema.frameLabel,
					fieldErrors: validation.errors,
				};
			}
		});

		// Set validation results
		setValidationResults({
			isValid: Object.keys(errors).length === 0,
			errors,
		});

		setIsValidating(false);
		setValidationOpen(true);
	};

	// Export annotations after validation
	const handleExport = () => {
		setIsExporting(true);

		try {
			const exportData = useAnnotationStore.getState().exportAnnotations();

			// Filter for just this document if documentId is provided
			const documentData = documentId
				? {
						document: documents.find((d) => d.id === documentId),
						knowledgeUnits: documentKUs,
				  }
				: exportData;

			// In a real application, you would send this to a server
			// For now, we'll simulate an export
			console.log('Exported data:', documentData);

			// Create a JSON file for download
			const dataStr = JSON.stringify(documentData, null, 2);
			const dataUri =
				'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

			const exportFileDefaultName = `annotations_${documentName.replace(
				/\s+/g,
				'_'
			)}.json`;

			// @ts-expect-error
			const linkElement = document.createElement('a');
			linkElement.setAttribute('href', dataUri);
			linkElement.setAttribute('download', exportFileDefaultName);
			linkElement.click();

			setIsExporting(false);
			setValidationOpen(false);
		} catch (error) {
			console.error('Export error:', error);
			setIsExporting(false);
		}
	};

	// Close the validation dialog
	const handleCloseValidation = () => {
		setValidationOpen(false);
	};

	return (
		<>
			{/* Export & Validation Button */}
			<Button
				variant='contained'
				fullWidth
				startIcon={<CloudUploadIcon />}
				disabled={!documentId || documentKUs.length === 0}
				onClick={validateDocument}
				sx={{ mt: 2 }}
			>
				Validate & Export
			</Button>

			{/* Validation Dialog */}
			<Dialog
				open={validationOpen}
				onClose={handleCloseValidation}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>
					{isValidating ? 'Validating Annotations...' : 'Validation Results'}
				</DialogTitle>
				<DialogContent>
					{isValidating ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress />
						</Box>
					) : (
						<>
							{validationResults.isValid ? (
								<Alert severity='success' sx={{ mb: 2 }}>
									All annotations are valid! You can now export the data.
								</Alert>
							) : (
								<Alert severity='error' icon={<WarningIcon />} sx={{ mb: 2 }}>
									There are validation errors that need to be fixed before
									exporting.
								</Alert>
							)}

							{!validationResults.isValid && (
								<Box sx={{ mt: 2 }}>
									<Typography variant='h6'>Validation Errors:</Typography>
									<List>
										{Object.entries(validationResults.errors).map(
											([kuId, kuError]) => (
												<ListItem
													key={kuId}
													sx={{
														flexDirection: 'column',
														alignItems: 'flex-start',
													}}
												>
													<ListItemText
														// @ts-expect-error
														primary={`Knowledge Unit: ${kuError.kuType}`}
														primaryTypographyProps={{ fontWeight: 'bold' }}
													/>
													<Box sx={{ pl: 2, width: '100%' }}>
														{/* @ts-expect-error */}
														{Object.entries(kuError.fieldErrors).map(
															([fieldId, errors]) => (
																<Box key={fieldId} sx={{ mb: 1 }}>
																	<Typography variant='subtitle2'>
																		Field: {fieldId}
																	</Typography>
																	<List dense disablePadding>
																		{/* @ts-expect-error */}
																		{errors.map((error, index) => (
																			<ListItem key={index} dense>
																				<ListItemText
																					primary={`• ${error}`}
																					primaryTypographyProps={{
																						color: 'error',
																					}}
																				/>
																			</ListItem>
																		))}
																	</List>
																</Box>
															)
														)}
													</Box>
													<Divider sx={{ width: '100%', my: 1 }} />
												</ListItem>
											)
										)}
									</List>
								</Box>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseValidation}>Close</Button>
					{validationResults.isValid && (
						<Button
							onClick={handleExport}
							variant='contained'
							color='primary'
							disabled={isExporting}
							startIcon={
								isExporting ? (
									<CircularProgress size={24} />
								) : (
									<CloudUploadIcon />
								)
							}
						>
							{isExporting ? 'Exporting...' : 'Export Annotations'}
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ValidationExport;
