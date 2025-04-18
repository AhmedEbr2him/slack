import { UserButton } from '@/features/auth/components/user-button';
import { WorkspaceSwitcher } from './workspace-switcher';
import { SidebarButton } from './sidebar-button';
import { Bell, Home, MessagesSquare, MoreHorizontal } from 'lucide-react';

export const Sidebar = () => {
	const sidebarItems = [
		{
			icon: Home,
			label: 'Home',
			isActive: true,
		},
		{
			icon: MessagesSquare,
			label: 'DMs',
			isActive: false,
		},
		{
			icon: Bell,
			label: 'Activity',
			isActive: false,
		},
		{
			icon: MoreHorizontal,
			label: 'More',
			isActive: false,
		},
	];

	return (
		<aside className='w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-9 pb-4'>
			<WorkspaceSwitcher />
			{sidebarItems.map(({ icon, label, isActive }) => (
				<SidebarButton
					key={label}
					icon={icon}
					label={label}
					isActive={isActive}
				/>
			))}
			<div className='flex flex-col items-center justify-center gap-y-1 mt-auto'>
				<UserButton />
			</div>
		</aside>
	);
};
