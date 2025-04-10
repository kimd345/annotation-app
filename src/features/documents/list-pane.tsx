import React from 'react';
import {
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
	Box,
	Divider,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import useAnnotationStore from '../../store/use-annotation-store';
import { useShallow } from 'zustand/shallow';

const DocumentList = () => {
	const { documents, selectedDocumentId, selectDocument } = useAnnotationStore(
		// https://zustand.docs.pmnd.rs/hooks/use-shallow#useshallow-%E2%9A%9B%EF%B8%8F
		// Component re-renders whenever any part of the state changes, causing infinite re-render loop.
		// useShallow makes sure the component only re-renders when the store changes.
		useShallow((state) => ({
			documents: state.documents,
			selectedDocumentId: state.selectedDocumentId,	// Indicate selected document
			selectDocument: state.selectDocument,	// Display document in view pane
		}))
	);

	// Group documents by annotation status
	const annotatedDocs = documents.filter((doc) => doc.hasAnnotations);
	const unannotatedDocs = documents.filter((doc) => !doc.hasAnnotations);

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
				<Typography variant='h6' display='flex' alignItems='center'>
					<FolderIcon sx={{ mr: 1 }} />
					Documents
				</Typography>
			</Box>

			<Box sx={{ flexGrow: 1, overflow: 'auto' }}>
				{documents.length === 0 ? (
					<Typography color='text.secondary' align='center' sx={{ py: 4 }}>
						No documents available
					</Typography>
				) : (
					<List disablePadding>
						{/* Annotated documents section */}
						{annotatedDocs.length > 0 && (
							<>
								<ListItem>
									<ListItemText
										primary='Annotated Documents'
										primaryTypographyProps={{
											variant: 'subtitle2',
											color: 'primary',
										}}
									/>
								</ListItem>

								{annotatedDocs.map((doc) => (
									<ListItem key={doc.id} disablePadding>
										<ListItemButton
											selected={selectedDocumentId === doc.id}
											onClick={() => selectDocument(doc.id)}
											sx={{
												borderLeft:
													selectedDocumentId === doc.id
														? '3px solid'
														: '3px solid transparent',
												borderLeftColor: 'primary.main',
											}}
										>
											<BookmarkIcon
												color='primary'
												fontSize='small'
												sx={{ mr: 1 }}
											/>
											<ListItemText
												primary={doc.title}
												primaryTypographyProps={{
													noWrap: true,
													fontSize: '0.9rem',
												}}
											/>
										</ListItemButton>
									</ListItem>
								))}

								<Divider sx={{ my: 1 }} />
							</>
						)}

						{/* Unannotated documents section */}
						{unannotatedDocs.length > 0 && (
							<>
								<ListItem>
									<ListItemText
										primary='Available Documents'
										primaryTypographyProps={{ variant: 'subtitle2' }}
									/>
								</ListItem>

								{unannotatedDocs.map((doc) => (
									<ListItem key={doc.id} disablePadding>
										<ListItemButton
											selected={selectedDocumentId === doc.id}
											onClick={() => selectDocument(doc.id)}
											sx={{
												borderLeft:
													selectedDocumentId === doc.id
														? '3px solid'
														: '3px solid transparent',
												borderLeftColor: 'primary.main',
											}}
										>
											<DescriptionIcon
												color='action'
												fontSize='small'
												sx={{ mr: 1 }}
											/>
											<ListItemText
												primary={doc.title}
												primaryTypographyProps={{
													noWrap: true,
													fontSize: '0.9rem',
												}}
											/>
										</ListItemButton>
									</ListItem>
								))}
							</>
						)}
					</List>
				)}
			</Box>
		</Paper>
	);
};

export default DocumentList;
