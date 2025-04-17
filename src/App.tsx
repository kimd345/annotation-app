import React from 'react';
import { Box } from '@mui/material';
import DocumentList from './features/documents/list-pane';
import DocumentView from './features/documents/view-pane';
import AnnotationPanel from './features/annotations/annotation-pane';
import useAnnotationStore from './store/use-annotation-store';
import { dummyDocuments, knowledgeUnitSchemas } from './lib/mock-data';

import './App.css';

function App() {
	// Initialize store with dummy data
	React.useEffect(() => {
		const store = useAnnotationStore.getState();

		// Set dummy documents and schemas
		store.documents = dummyDocuments;
		store.knowledgeUnitSchemas = knowledgeUnitSchemas;

		// Select the first document by default
		if (dummyDocuments.length > 0) {
			store.selectDocument(dummyDocuments[0].id);
		}
	}, []);

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					height: '90vh',	// TODO: Fix responsiveness
					overflow: 'hidden',
					backgroundColor: '#f5f5f5',
				}}
			>
				{/* Three-panel layout */}
				<Box sx={{ width: '20%', height: '100%' }}>
					<DocumentList />
				</Box>

				<Box sx={{ width: '45%', height: '100%' }}>
					<DocumentView />
				</Box>

				<Box sx={{ width: '35%', height: '100%' }}>
					<AnnotationPanel />
				</Box>
			</Box>
		</>
	);
}

export default App;
