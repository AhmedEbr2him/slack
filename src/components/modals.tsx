'use client';

import { useEffect, useState } from 'react';

import { CreateChannelModal } from '@/features/channels/components/create-channel-modal';
import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal';

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
			<CreateChannelModal />
		</>
	);
};
