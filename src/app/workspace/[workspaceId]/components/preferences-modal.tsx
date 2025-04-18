import { useState } from 'react';
import { TrashIcon } from 'lucide-react';

import { useUpdateWorkspace } from '@/features/workspaces/api/use-update-workspace';
import { useDeleteWorkspace } from '@/features/workspaces/api/use-delete-workspace';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/hooks/use-confirm';

interface PreferenceModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	initialValues: string;
}
export const PreferencesModal = ({ open, setOpen, initialValues }: PreferenceModalProps) => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
		'Are you sure to delete workspace?',
		'This action is irreversible.'
	);

	const [value, setValue] = useState(initialValues);
	const [editOpen, setEditOpen] = useState(false);

	const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace();
	const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();

	const handleDelete = async () => {
		const ok = await confirmDelete();
		if (!ok) return;

		deleteWorkspace(
			{
				id: workspaceId,
			},
			{
				onSuccess: () => {
					toast.success('Workspace deleted successfully');
					router.replace('/');
				},
				onError: () => {
					toast.error('Faild to delete workspace');
				},
			}
		);
	};

	const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		updateWorkspace(
			{
				id: workspaceId,
				name: value,
			},
			{
				onSuccess: () => {
					setEditOpen(false);
					toast.success('Workspace updated successfully');
				},
				onError: () => {
					toast.error('Faild to update workspace');
				},
			}
		);
	};
	return (
		<>
			<ConfirmDeleteDialog />
			<Dialog
				open={open}
				onOpenChange={setOpen}>
				<DialogContent className='p-0 bg-gray-50 overflow-hidden'>
					<DialogHeader className='p-4 border-b bg-white'>
						<DialogTitle>{value}</DialogTitle>
					</DialogHeader>

					<div className='px-4 pb-4 flex flex-col gap-y-2'>
						<Dialog
							open={editOpen}
							onOpenChange={setEditOpen}>
							<DialogTrigger asChild>
								<div className='px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50'>
									<div className='flex items-center justify-between'>
										<p className='text-sm font-semibold'>Workspace name</p>
										<p className='text-sm text-[#1264a3] hover:underline font-semibold'>
											Edit
										</p>
									</div>

									<p className='text-sm'>{value}</p>
								</div>
							</DialogTrigger>
							{/* Edit workspace modal */}
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Rename this workspace</DialogTitle>
								</DialogHeader>
								<form
									className='space-y-4'
									onSubmit={handleEdit}>
									<Input
										value={value}
										disabled={isUpdatingWorkspace}
										onChange={e => setValue(e.target.value)}
										required
										autoFocus
										minLength={3}
										maxLength={80}
										placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
									/>
									<DialogFooter>
										<DialogClose asChild>
											<Button
												variant='outline'
												disabled={isUpdatingWorkspace}>
												Cancel
											</Button>
										</DialogClose>
										<Button disabled={isUpdatingWorkspace}>Save</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						<button
							disabled={isDeletingWorkspace}
							onClick={handleDelete}
							className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600'>
							<TrashIcon className='size-4' />
							<p className='text-sm font-semibold'>Delete workspace</p>
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
