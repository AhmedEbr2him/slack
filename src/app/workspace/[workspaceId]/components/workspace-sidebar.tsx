import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetWorkSpace } from '@/features/workspaces/api/use-get-workspace';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { AlertTriangle, Loader } from 'lucide-react';
import { WorkspaceHeader } from './workspace-header';

export const WorkspaceSidebar = () => {
	const workspaceId = useWorkspaceId();

	const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
	const { data: workspace, isLoading: workspaceLoading } = useGetWorkSpace({ id: workspaceId });

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
		</div>
	);
};
