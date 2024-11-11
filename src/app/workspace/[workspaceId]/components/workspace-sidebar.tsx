import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizonal } from 'lucide-react';

import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetWorkSpace } from '@/features/workspaces/api/use-get-workspace';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { WorkspaceSection } from './workspace-section';
import { useGetMembers } from '@/features/members/api/use-getmembers';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { SidebarItem } from './sidebar-items';
import { WorkspaceHeader } from './workspace-header';
import { UserItem } from './user-item';

export const WorkspaceSidebar = () => {
	const workspaceId = useWorkspaceId();

	const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
	const { data: workspace, isLoading: workspaceLoading } = useGetWorkSpace({ id: workspaceId });
	const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });
	const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });

	const isLoading = memberLoading || workspaceLoading;

	if (isLoading) {
		return (
			<div className='h-full flex flex-col items-center justify-center bg-[#5E2C5F]'>
				<Loader className='size-5 animate-spin text-white' />
			</div>
		);
	}

	if (!member || !workspace) {
		return (
			<div className='h-full flex flex-col gap-y-2 items-center justify-center bg-[#5E2C5F]'>
				<AlertTriangle className='size-5 text-destructive' />
				<p className='text-white text-sm'>Workspace not found</p>
			</div>
		);
	}
	return (
		<div className='h-full flex flex-col bg-[#5E2C5F]'>
			<WorkspaceHeader
				workspace={workspace}
				isAdmin={member.role === 'admin'}
			/>

			<div className='flex flex-col px-2 mt-3'>
				<SidebarItem
					label='Threads'
					icon={MessageSquareText}
					id='threads'
				/>
				<SidebarItem
					label='Drafts & Sent'
					icon={SendHorizonal}
					id='drafts'
				/>
			</div>

			<WorkspaceSection
				label='Channels'
				hint='New channel'
				onNew={() => {}}>
				{channels?.map(channelItem => (
					<SidebarItem
						key={channelItem._id}
						id={channelItem._id}
						label={channelItem.name}
						icon={HashIcon}
					/>
				))}
			</WorkspaceSection>

			<WorkspaceSection
				label='Direct Messages'
				hint='New direct message'
				onNew={() => {}}>
				{members?.map(memberItem => (
					<UserItem
						key={memberItem._id}
						id={memberItem._id}
						label={memberItem.user.name}
						image={memberItem.user.image}
					/>
				))}
			</WorkspaceSection>
		</div>
	);
};
