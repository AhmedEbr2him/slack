import { CopyIcon, Loader, RefreshCcw } from 'lucide-react';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useResetJoinCode } from '@/features/workspaces/api/use-reset-join-code';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';

interface InviteModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	name: string;
	joinCode: string;
}
export const InviteModal = ({ open, setOpen, name, joinCode }: InviteModalProps) => {
	const workspaceId = useWorkspaceId();
	const [ConfirmDialog, confirm] = useConfirm(
		'Are your sure to reset invite code?',
		'This will deactivate the current invite code and generate a new one.'
	);

	const { mutate, isPending } = useResetJoinCode();

	const handleCopy = () => {
		const inviteLink = `${window.location.origin}/join/${workspaceId}`;

		navigator.clipboard
			.writeText(inviteLink)
			.then(() => toast.success('Invite link copied to clipboard.'));
	};

	const handleNewCode = async () => {
		const ok = await confirm();
		if (!ok) return;

		mutate(
			{
				workspaceId,
			},
			{
				onSuccess: () => {
					toast.success('Invite code regenerated successfully.');
				},
				onError: () => {
					toast.error('Faild to regenerated invite code.');
				},
			}
		);
	};
	return (
		<>
			<ConfirmDialog />
			<Dialog
				open={open}
				onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite people to {name} workspace</DialogTitle>
						<DialogDescription>
							Use the code below to invite people to your workspace
						</DialogDescription>
					</DialogHeader>

					<div className='flex flex-col gap-y-4 items-center justify-center py-10'>
						{isPending ? (
							<div className='h-full flex items-center justify-center'>
								<Loader className='size-6 animate-spin text-muted-foreground' />
							</div>
						) : (
							<p className='text-4xl font-bold tracking-widest uppercase'>{joinCode}</p>
						)}

						<Button
							variant='ghost'
							size='sm'
							disabled={isPending}
							onClick={handleCopy}>
							Copy link <CopyIcon className='size-4 ml-2' />
						</Button>
					</div>

					<div className='flex items-center justify-between w-full'>
						<Button
							variant='ghost'
							disabled={isPending}
							onClick={handleNewCode}>
							Reset Join Code
							<RefreshCcw className='size-4 ml-2' />
						</Button>
						<DialogClose asChild>
							<Button disabled={isPending}>Close</Button>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};