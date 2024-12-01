'use client';

import { useRouter } from 'next/navigation';

import { UserButton } from '@/features/auth/components/user-button';
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal';
import { useGetWorkSpaces } from '@/features/workspaces/api/use-get-workspaces';
import { useEffect, useMemo } from 'react';

export default function Home() {
	const router = useRouter();

	const { data, isLoading } = useGetWorkSpaces();

	const [open, setOpen] = useCreateWorkspaceModal();

	const workspaceId = useMemo(() => data?.[0]?._id, [data]);


	useEffect(() => {
		// Only attempt route replacement when loading is finished
		if (isLoading) return;

		if (workspaceId) {
			router.replace(`/workspace/${workspaceId}`); // can't get back to previous page
		} else if (!open) {
			setOpen(true);
		}
	}, [isLoading, workspaceId, open, setOpen, router]);
	return (
		<div>
			<UserButton />
		</div>
	);
}
