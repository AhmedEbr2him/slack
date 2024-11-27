import Quill from 'quill';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useCreateMessage } from '@/features/messages/api/use-create-message';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface ChatInputProps {
	placeholder: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {
	const [editorKey, setEditorKey] = useState(0);
	const [isPending, setIsPending] = useState(false);

	const editorRef = useRef<Quill | null>(null);

	const workspaceId = useWorkspaceId();
	const channelId = useChannelId();

	const { mutate: createMessage } = useCreateMessage();
	const handleSubmit = async ({
		body,
		image
	}: {
		body: string,
		image: File | null
	}) => {
		try {
			setIsPending(true);

			await createMessage({
				body,
				workspaceId,
				channelId,
			}, { throwError: true });

			// Every time the key changes the editor component will be destroyed and rebuild again and from this way the entire state will be reset
			setEditorKey((prevKey) => prevKey + 1);
			// editorRef?.current?.setContents([]);
		} catch (error) {
			toast.error("Faild to send message!")
		} finally {
			setIsPending(false)
		}

	};
	console.log(isPending);

	return (
		<div className='px-5 w-full'>
			<Editor
				key={editorKey}
				placeholder={placeholder}
				onSubmit={handleSubmit}
				disabled={isPending}
				innerRef={editorRef}
			/>
		</div>
	);
};
