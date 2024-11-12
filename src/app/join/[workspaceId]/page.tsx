'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useJoinMember } from '@/features/workspaces/api/use-join-member';
import { useGetWorkSpaceInfo } from '@/features/workspaces/api/use-get-workspace-info';

import { cn } from '@/lib/utils';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const JoinPage = () => {
	const router = useRouter();

	const workspaceId = useWorkspaceId();

	const { data, isLoading } = useGetWorkSpaceInfo({ id: workspaceId });

	const [value, setValue] = useState('');

	const { mutate, isPending } = useJoinMember();

	const isMember = useMemo(() => data?.isMember, [data?.isMember]);

	// Redirect if the user is already member of this workspace to avoid back to join papge
	useEffect(() => {
		if (isMember) {
			router.push(`/workspace/${workspaceId}`);
		}
	}, [isMember, router, workspaceId]);

	const handleComplete = (value: string) => {
		mutate(
			{
				joinCode: value,
				workspaceId,
			},
			{
				onSuccess: id => {
					router.replace(`/workspace/${id}`);
					toast.success(`Joined to ${data?.name} successfully.`);
				},
				onError: () => {
					toast.error(`Faild to join ${data?.name}.`);
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				<Loader className='size-6 animate-spin text-muted-foreground' />
			</div>
		);
	}
	return (
		<div className='h-full flex flex-col gap-y-8 items-center justify-center bg-white rounded-lg shadow-md'>
			<Image
				src='/logo.svg'
				width={160}
				height={80}
				priority={true}
				alt='logo'
				style={{ width: 'auto', height: 'auto' }}
			/>
			<div className='flex flex-col gap-y-4 items-center justify-center max-w-md'>
				<div className='flex flex-col gap-y-2 items-center justify-center'>
					<h1 className='text-2xl font-bold'>Join {data?.name}</h1>
					<p className='text-md text-muted-foreground'>Enter the workspace code to join</p>
				</div>
				<div className='space-y-2'>
					<InputOTP
						maxLength={6}
						value={value}
						onChange={value => setValue(value)}
						onComplete={handleComplete}>
						<InputOTPGroup className={cn(isPending && 'opacity-50 cursor-not-allowed')}>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>
			</div>
			<div className='flex gap-x-4'>
				<Button
					variant='outline'
					size='lg'
					asChild>
					<Link href='/'>Back to home</Link>
				</Button>
			</div>
		</div>
	);
};

export default JoinPage;
