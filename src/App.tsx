import { useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DocumentView from './features/documents/document-view';
import ListView from './features/documents/list-view';
import AnnotationView from './features/annotations/annotation-view';
import CustomFieldModal from './features/annotations/custom-field-modal';
import { initializeStore } from './lib/mock-data';

// Create a theme instance
const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
	},
});

function App() {
	// Initialize store
	useEffect(() => {
		initializeStore();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
				{/* Left sidebar - Document list */}
				<Box
					sx={{
						width: 250,
						flexShrink: 0,
						borderRight: '1px solid #e0e0e0',
						overflow: 'auto',
					}}
				>
					<ListView />
				</Box>

				{/* Main content - Document viewer */}
				{/* TODO: Fix width */}
				<Box
					sx={{
						flex: 1,
						overflow: 'auto',
						width: 'calc(100vw - 250px - 420px)',
					}}
				>
					<DocumentView />
				</Box>

				{/* Right sidebar - Annotation panel */}
				<Box
					sx={{
						width: 420,
						flexShrink: 0,
						borderLeft: '1px solid #e0e0e0',
						overflow: 'auto',
					}}
				>
					<AnnotationView />
				</Box>
			</Box>

			{/* Custom field modal - global component */}
			<CustomFieldModal />
		</ThemeProvider>
	);
}

export default App;
