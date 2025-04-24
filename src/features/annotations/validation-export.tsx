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
import {
	useDocumentAnnotationsQuery,
	useDocumentQuery,
	useExportAnnotationsMutation,
} from '@/hooks/use-api';
import { validateKnowledgeUnit } from '@/utils/validation';
import useAnnotationStore from '@/store/use-annotation-store';
import { useShallow } from 'zustand/shallow';

const ValidationExport = ({ documentId }: { documentId: string | null }) => {
	const { knowledgeUnitSchemas } = useAnnotationStore(
		useShallow((state) => ({
			knowledgeUnitSchemas: state.knowledgeUnitSchemas,
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

	// Fetch document and annotations
	const { data: document } = useDocumentQuery(documentId);
	const { data: annotations, isLoading: isLoadingAnnotations } =
		useDocumentAnnotationsQuery(documentId);

	// Export mutation
	const exportMutation = useExportAnnotationsMutation();

	// Document name for export
	const documentName = document ? document.title : 'Unknown Document';

	// Validate all KUs in the document
	const validateDocument = () => {
		setIsValidating(true);
		setValidationOpen(true);

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
		if (annotations) {
			annotations.forEach((ku) => {
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
		}

		// Set validation results
		setValidationResults({
			isValid: Object.keys(errors).length === 0,
			errors,
		});

		setIsValidating(false);
	};

	// Export annotations after validation
	const handleExport = () => {
		if (!documentId) return;

		exportMutation.mutate(documentId, {
			onSuccess: (data) => {
				// Create a JSON file for download
				const dataStr = JSON.stringify(data, null, 2);
				const dataUri =
					'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

				const exportFileDefaultName = `annotations_${documentName.replace(
					/\s+/g,
					'_'
				)}.json`;

				const linkElement = document.createElement('a');
				linkElement.setAttribute('href', dataUri);
				linkElement.setAttribute('download', exportFileDefaultName);
				linkElement.click();

				setValidationOpen(false);
			},
		});
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
				disabled={
					!documentId ||
					isLoadingAnnotations ||
					(annotations && annotations.length === 0)
				}
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
														primary={`Knowledge Unit: ${kuError.kuType}`}
														primaryTypographyProps={{ fontWeight: 'bold' }}
													/>
													<Box sx={{ pl: 2, width: '100%' }}>
														{Object.entries(kuError.fieldErrors).map(
															([fieldId, errors]) => (
																<Box key={fieldId} sx={{ mb: 1 }}>
																	<Typography variant='subtitle2'>
																		Field: {fieldId}
																	</Typography>
																	<List dense disablePadding>
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
							disabled={exportMutation.isPending}
							startIcon={
								exportMutation.isPending ? (
									<CircularProgress size={24} />
								) : (
									<CloudUploadIcon />
								)
							}
						>
							{exportMutation.isPending ? 'Exporting...' : 'Export Annotations'}
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ValidationExport;
