import { useState } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { TriangleAlert } from 'lucide-react';

import { useAuthActions } from '@convex-dev/auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { SignInFlow } from '../types';

interface SignUpCardProps {
	setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
	const { signIn } = useAuthActions();

	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState('');

	const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setIsPending(true);

		signIn('password', { name, email, password, flow: 'signUp' })
			.catch(() => {
				setError('Something went wrong!');
			})
			.finally(() => {
				setIsPending(false);
			});
	};

	const onProviderSignUp = (value: 'github' | 'google') => {
		setIsPending(true);
		signIn(value).finally(() => {
			setTimeout(() => setIsPending(false), 1500);
		});
	};
	return (
		<Card className='w-full h-full p-8'>
			<CardHeader className='px-0 pt-0'>
				<CardTitle>Sign up to continue</CardTitle>
				<CardDescription>Use your email or another service to continue</CardDescription>
			</CardHeader>
			{!!error && (
				<div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
					<TriangleAlert className='size-4' />
					<p>{error}</p>
				</div>
			)}
			<CardContent className='space-y-5 px-0 pb-0'>
				<form
					onSubmit={onPasswordSignUp}
					className='space-y-2.5'>
					<Input
						disabled={false}
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='Full Name'
						type='text'
						required
					/>
					<Input
						disabled={false}
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder='Email'
						type='email'
						required
					/>
					<Input
						disabled={false}
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder='Password'
						type='password'
						required
					/>
					<Input
						disabled={false}
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						placeholder='Confirm password'
						type='password'
						required
					/>

					<Button
						type='submit'
						className='w-full'
						size='lg'
						disabled={isPending}>
						Continue
					</Button>
				</form>
				<Separator />

				<div className='flex flex-col gap-y-2.5'>
					<Button
						disabled={isPending}
						onClick={() => onProviderSignUp('google')}
						variant='outline'
						size='lg'
						className='w-full relative'>
						<FcGoogle className='size-5 absolute top-3 left-2.5' />
						Continue with Google
					</Button>
					<Button
						disabled={isPending}
						onClick={() => onProviderSignUp('github')}
						variant='outline'
						size='lg'
						className='w-full relative'>
						<FaGithub className='size-5 absolute top-3 left-2.5' />
						Continue with Github
					</Button>
				</div>

				<p className='text-xs text-muted-foreground'>
					Already have an account?{' '}
					<span
						onClick={() => setState('signIn')}
						className='text-sky-700 hover:underline cursor-pointer'>
						Sign In
					</span>
				</p>
			</CardContent>
		</Card>
	);
};
