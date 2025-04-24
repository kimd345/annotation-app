import { useState, useEffect, useRef, useCallback } from 'react';
import {
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
	Box,
	Divider,
	CircularProgress,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useShallow } from 'zustand/shallow';
import useAnnotationStore from '@/store/use-annotation-store';
import { useDocumentsQuery } from '@/hooks/use-api';

const ListView = () => {
	const { selectedDocumentId, selectDocument } = useAnnotationStore(
		useShallow((state) => ({
			selectedDocumentId: state.selectedDocumentId,
			selectDocument: state.selectDocument,
		}))
	);

	// State for infinite scrolling
	const [page, setPage] = useState(0);
	const [allDocuments, setAllDocuments] = useState([]);
	const observer = useRef(null);
	const lastDocumentElementRef = useRef(null);

	// Use the query hook to fetch documents
	const { data, isLoading, isError, isFetching } = useDocumentsQuery(page);

	// Update local state when data is loaded
	useEffect(() => {
		if (data && data.documents) {
			if (page === 0) {
				// First page - replace all documents
				setAllDocuments(data.documents);
			} else {
				// Additional pages - append documents
				setAllDocuments((prev) => [...prev, ...data.documents]);
			}
		}
	}, [data, page]);

	// Intersection observer for infinite scrolling
	const lastDocumentRef = useCallback(
		(node) => {
			if (isFetching) return;
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && data?.metadata.hasMore) {
					setPage((prevPage) => prevPage + 1);
				}
			});

			if (node) {
				observer.current.observe(node);
				lastDocumentElementRef.current = node;
			}
		},
		[isFetching, data?.metadata?.hasMore]
	);

	// Group documents by annotation status
	const annotatedDocs = allDocuments.filter((doc) => doc.hasAnnotations);
	const unannotatedDocs = allDocuments.filter((doc) => !doc.hasAnnotations);

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
				{isLoading && page === 0 ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress />
					</Box>
				) : isError ? (
					<Typography color='error' align='center' sx={{ py: 4 }}>
						Failed to load documents. Please try again.
					</Typography>
				) : allDocuments.length === 0 ? (
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

								{annotatedDocs.map((doc, index) => {
									const isLastItem = index === annotatedDocs.length - 1;
									return (
										<div
											key={doc.id}
											ref={
												isLastItem && unannotatedDocs.length === 0
													? lastDocumentRef
													: null
											}
										>
											<ListItem disablePadding>
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
														secondary={doc.fileName}
														slotProps={{
															primary: {
																noWrap: true,
																fontSize: '0.9rem',
															},
															secondary: {
																noWrap: true,
																fontSize: '0.7rem',
															},
														}}
													/>
												</ListItemButton>
											</ListItem>
										</div>
									);
								})}

								<Divider sx={{ my: 1 }} />
							</>
						)}

						{/* Unannotated documents section */}
						{unannotatedDocs.length > 0 && (
							<>
								<ListItem>
									<ListItemText
										primary='Available Documents'
										slotProps={{
											primary: {
												variant: 'subtitle2',
											},
										}}
									/>
								</ListItem>

								{unannotatedDocs.map((doc, index) => {
									const isLastItem = index === unannotatedDocs.length - 1;
									return (
										<div key={doc.id} ref={isLastItem ? lastDocumentRef : null}>
											<ListItem disablePadding>
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
														secondary={doc.fileName}
														slotProps={{
															primary: {
																noWrap: true,
																fontSize: '0.9rem',
															},
															secondary: {
																noWrap: true,
																fontSize: '0.7rem',
															},
														}}
													/>
												</ListItemButton>
											</ListItem>
										</div>
									);
								})}
							</>
						)}

						{/* Loading indicator for infinite scroll */}
						{isFetching && page > 0 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
								<CircularProgress size={24} />
							</Box>
						)}
					</List>
				)}
			</Box>
		</Paper>
	);
};

export default ListView;
