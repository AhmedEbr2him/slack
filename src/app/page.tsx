'use client';

import { Button } from '@/components/ui/button';
import { useAuthActions } from '@convex-dev/auth/react';

export default function Home() {
	const { signOut } = useAuthActions();

	return (
		<div>
			Home!
			<Button onClick={() => signOut()}>Logout</Button>
		</div>
	);
}
