import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InfoIcon, Search } from 'lucide-react';


import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetWorkSpace } from '@/features/workspaces/api/use-get-workspace';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command"

export const Toolbar = () => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();

	const { data } = useGetWorkSpace({ id: workspaceId });
	const { data: channels } = useGetChannels({ workspaceId });
	const { data: members } = useGetMembers({ workspaceId });

	const [open, setOpen] = useState(false);

	const onLinkClicked = (id: string, type: string) => {
		setOpen(false);
		router.push(`/workspace/${workspaceId}/${type}/${id}`)
	}
	return (
		<nav className='bg-[#481349] flex items-center justify-between h-10 p-1.5'>
			<div className='flex-1' />
			<div className='min-w-[280px] max-[642px] grow-[2] shrink'>
				<Button
					size='sm'
					className='bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2'
					onClick={() => setOpen(true)}
				>
					<Search className='size-4 text-white mr-2' />
					<span className='text-white text-xs'>Search {data?.name}</span>
				</Button>
				<Command>
					<CommandDialog open={open} onOpenChange={setOpen}>
						<CommandInput placeholder="Type a command or search..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup heading="Channels">
								{channels?.map((channel) => (
									<CommandItem
										key={channel._id}
										className='font-semibold'
										onSelect={() => onLinkClicked(channel._id, 'channel')}
									>
										{channel.name}
									</CommandItem>
								))}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup heading="Members">
								{members?.map((member) => (
									<CommandItem
										key={member._id}
										className='font-semibold'
										onSelect={() => onLinkClicked(member._id, 'member')}
									>
										{member.user?.name}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</CommandDialog>
				</Command>
			</div>

			<div className='ml-auto flex flex-1 items-center justify-end'>
				<Button
					variant='transparent'
					size='sm'>
					<InfoIcon className='size-5 text-white' />
				</Button>
			</div>
		</nav>
	);
};
