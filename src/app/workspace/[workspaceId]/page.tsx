'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Loader, TriangleAlert } from 'lucide-react';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetWorkSpace } from '@/features/workspaces/api/use-get-workspace';
import { useGetChannels } from '@/features/channels/api/use-get-channels';

const WorkspaceIdPage = () => {
	const router = useRouter();
	const workspaceId = useWorkspaceId();
	const [open, setOpen] = useCreateChannelModal();

	const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
	const { data: workspace, isLoading: workspaceLoading } = useGetWorkSpace({ id: workspaceId });
	const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

	const channelId = useMemo(() => channels?.[0]?._id, [channels]);
	const isAdmin = useMemo(() => member?.role === 'admin', [member?.role]);

	// FIND AND REDIRECT USER TO FIRST CHANNEL WHEN FIRE APP TO AVOID GO TO WORKSPACE PAGE OR MAKE USER CREATE NEW CHANNEL IF THERE IS NO CHANNELS
	useEffect(() => {
		if (workspaceLoading || channelsLoading || memberLoading || !workspace || !member) return;

		if (channelId) {
			router.push(`/workspace/${workspaceId}/channel/${channelId}`);
		} else if (!open && isAdmin) {
			// ONLY IF WE ARE ADMIN AND NOT MEMBER  WE CAN CREATE A NEW CHANNEL
			setOpen(true);
		}
	}, [
		isAdmin,
		workspaceLoading,
		channelsLoading,
		memberLoading,
		workspaceId,
		channelId,
		workspace,
		member,
		open,
		setOpen,
		router,
	]);

	if (workspaceLoading || channelsLoading) {
		return (
			<div className='h-full flex flex-1 flex-col items-center justify-center gap-2'>
				<Loader className='size-6 animate-spin text-muted-foreground' />
			</div>
		);
	}

	// THIS IS KIND OF ERROR PAGE IF WORKSPACE GET DELETED WHILE WE ARE A GUEST OR LOOKING AT THIS
	if (!workspace) {
		return (
			<div className='h-full flex flex-1 flex-col items-center justify-center gap-2'>
				<TriangleAlert className='size-6 text-muted-foreground' />
				<span className='text-sm text-muted-foreground'>Workspace not found!</span>
			</div>
		);
	}

	// NO NEED FOR USER TO SEE ANY THING ELSE BECAUSE AT THIS POINT USER SHOULD BE REDIRECTED SOMEWHERE ELSE
	return (
		<div className='h-full flex flex-1 flex-col items-center justify-center gap-2'>
			<TriangleAlert className='size-6 text-muted-foreground' />
			<span className='text-sm text-muted-foreground'>No channel found.</span>
		</div>
	);
};

export default WorkspaceIdPage;
