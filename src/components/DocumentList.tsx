import {
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	IconButton,
	Divider,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import React from 'react';

export default function DocumentList({
	// TODO: Fix default props
	documents = [{ id: 1, title: 'Document 1' }],
	// onSelectDocument = () => {},
	onPrevPage = () => {},
	onNextPage = () => {},
}) {
	return (
		<Box
			sx={{
				width: 250,
				height: '100vh',
				borderRight: 1,
				borderColor: 'divider',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Pagination Controls */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
				<IconButton onClick={onPrevPage}>
					<ArrowBack />
				</IconButton>
				<IconButton onClick={onNextPage}>
					<ArrowForward />
				</IconButton>
			</Box>

			{/* Scrollable List */}
			<Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
				<List>
					{documents.map((doc, index) => (
						<React.Fragment key={doc.id}>
							<ListItem disablePadding>
								<ListItemButton /* onClick={() => onSelectDocument(doc)} */>
									<ListItemText
										primary={doc.title || `Document ${index + 1}`}
									/>
								</ListItemButton>
							</ListItem>
							<Divider />
						</React.Fragment>
					))}
				</List>
			</Box>
		</Box>
	);
}
