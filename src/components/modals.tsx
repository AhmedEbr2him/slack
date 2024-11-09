'use client';

import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal';
import { useEffect, useState } from 'react';

// we make it as client component to avoid and prevent potintial hydration error
// nothing happening here but we ensuring all components here will only shows on client rendering
export const Modals = () => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<>
			<CreateWorkspaceModal />
		</>
	);
};
