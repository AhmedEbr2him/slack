interface WorkspaceIdPageProps {
	params: {
		workspaceId: string;
	};
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {
	const workspaceId = params.workspaceId;
	return <div className=''>ID :{workspaceId}</div>;
};

export default WorkspaceIdPage;
