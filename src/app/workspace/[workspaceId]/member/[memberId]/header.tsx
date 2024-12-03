import { FaChevronDown } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import {
	Avatar,
	AvatarImage,
	AvatarFallback
} from "@/components/ui/avatar";

interface HeaderProps {
	memberName?: string;
	memberImage?: string;
	onClick?: () => void;
};

export const Header = ({
	memberName = "Member",
	memberImage,
	onClick
}: HeaderProps) => {
	const avatarFallback = memberName[0].charAt(0).toUpperCase();

	return (
		<div className='bg-white h-[49px] border-b flex items-center px-4 overflow-hidden'>
			<Button
				variant='ghost'
				className='text-lg font-semibold px-2 overflow-hidden w-auto'
				size='sm'
				onClick={onClick}
			>
				<Avatar className='size-6 mr-2'>
					<AvatarImage src={memberImage} />
					<AvatarFallback>
						{avatarFallback}
					</AvatarFallback>
				</Avatar>
				<span className="truncate">{memberName}</span>
				<FaChevronDown className='size-2.5 ml-2' />
			</Button>
		</div>
	);
};
