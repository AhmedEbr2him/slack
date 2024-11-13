import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Trash2Icon } from 'lucide-react';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';
import { useConfirm } from '@/hooks/use-confirm';

import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useDeleteChannel } from '@/features/channels/api/use-delete-channel';
import { useCurrentMember } from '@/features/members/api/use-current-member';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog';

interface HeaderProps {
	title: string;
}

export const Header = ({ title }: HeaderProps) => {
	const router = useRouter();
	const workspaceId = useWorkspaceId();
	const channelId = useChannelId();

	const [ConfirmDialog, confirm] = useConfirm(
		`Delete this channel?`,
		'You are about delete this channel. This action is irreversible'
	);

	const [value, setValue] = useState(title);
	const [editOpen, setEditOpen] = useState(false);

	const { data: member } = useCurrentMember({ workspaceId });
	const { mutate: updateChannel, isPending: isUpdatingPending } = useUpdateChannel();
	const { mutate: deleteChannel, isPending: isDeleteingPending } = useDeleteChannel();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\s+/g, '-').toLowerCase();
		setValue(value);
	};

	const handleEditOpen = (value: boolean) => {
		if (member?.role !== 'admin') return;

		setEditOpen(value);
	};
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		updateChannel(
			{
				id: channelId,
				name: value,
			},
			{
				onSuccess: () => {
					toast.success('Channel updated saved successfully');
				},
				onError: () => {
					toast.success('Faild to save channel updated');
				},
			}
		);
	};

	const handleDelete = async () => {
		const ok = await confirm();
		if (!ok) return;

		deleteChannel(
			{
				id: channelId,
			},
			{
				onSuccess: () => {
					toast.success('Channel deleted successfully');
					router.push(`/workspace/${workspaceId}`); // REDIRECT TO WORKSPACE PAGE THIS IN BASED IT FIRST AVILABLE CHANNEL ID
				},
				onError: () => {
					toast.error('Faild to delete channel');
				},
			}
		);
	};

	return (
		<div className='bg-white h-[49px] border-b flex items-center px-4 overflow-hidden'>
			<ConfirmDialog />
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant='ghost'
						size='sm'
						className='text-lg font-semibold px-2 overflow-hidden w-auto'>
						<span className='truncate'># {title}</span>
						<ChevronDown className='size-2.5 ml-2' />
					</Button>
				</DialogTrigger>

				<DialogContent className='p-0 bg-gray-50 overflow-hidden'>
					<DialogHeader className='p-4 border-b bg-white'>
						<DialogTitle># {title}</DialogTitle>
					</DialogHeader>

					<div className='px-4 pb-4 flex flex-col gap-y-2'>
						<Dialog
							open={editOpen}
							onOpenChange={handleEditOpen}>
							<DialogTrigger asChild>
								<div className='px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50'>
									<div className='flex items-center justify-between'>
										<p className='text-sm font-semibold'>Channel Name</p>
										{member?.role === 'admin' && (
											<p className='text-sm text-[#1264a3] hover:underline font-semibold'>
												Edit
											</p>
										)}
									</div>
									<p className='text-sm'># {title}</p>
								</div>
							</DialogTrigger>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Rename {title} name</DialogTitle>
								</DialogHeader>

								<form
									onSubmit={handleSubmit}
									className='space-y-4'>
									<Input
										value={value}
										disabled={isUpdatingPending}
										onChange={handleChange}
										required
										autoFocus
										minLength={3}
										maxLength={80}
										placeholder='e.g. plan-budget'
									/>

									<DialogFooter>
										<DialogClose asChild>
											<Button
												variant='outline'
												disabled={isUpdatingPending}>
												Cancel
											</Button>
										</DialogClose>

										<Button disabled={false}>Save Changes</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>

						{member?.role === 'admin' && (
							<button
								disabled={isUpdatingPending || isDeleteingPending}
								onClick={handleDelete}
								className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600'>
								<Trash2Icon className='size-4' />
								<p className='text-sm font-semibold'>Delete channel</p>
							</button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
