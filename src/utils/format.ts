// Generate a color based on field ID (simplified version)
export const getColorForField = (fieldId: string) => {
	// Simple hash function to generate a color
	const hash = fieldId.split('').reduce((acc, char) => {
		return char.charCodeAt(0) + ((acc << 5) - acc);
	}, 0);

	const h = Math.abs(hash) % 360;
	return `hsl(${h}, 70%, 80%)`;
};

