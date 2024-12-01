import Quill from 'quill';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import type { Id } from '../../../../../../../convex/_generated/dataModel';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false });

interface ChatInputProps {
	placeholder: string;
};

interface CreateMessageValues {
	channelId: Id<"channels">;
	workspaceId: Id<"workspaces">;
	body: string;
	image?: Id<"_storage"> | undefined;
};

export const ChatInput = ({ placeholder }: ChatInputProps) => {
	const [editorKey, setEditorKey] = useState(0);
	const [isPending, setIsPending] = useState(false);

	const editorRef = useRef<Quill | null>(null);

	const workspaceId = useWorkspaceId();
	const channelId = useChannelId();

	const { mutate: createMessage } = useCreateMessage();
	const { mutate: generateUploadUrl } = useGenerateUploadUrl();

	const handleSubmit = async ({
		body,
		image
	}: {
		body: string,
		image: File | null
	}) => {
		try {
			setIsPending(true);
			editorRef?.current?.enable(false);

			const valuse: CreateMessageValues = {
				channelId,
				workspaceId,
				body,
				image: undefined,
			};

			if (image) {
				const url = await generateUploadUrl({}, { throwError: true });


				if (!url) {
					throw new Error("URL not found.");
				};

				const result = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": image.type },
					body: image,
				});

				if (!result.ok) {
					throw new Error("Faild to upload image.");
				};

				const { storageId } = await result.json();

				valuse.image = storageId;
			};

			await createMessage(valuse, { throwError: true });

			// Every time the key changes the editor component will be destroyed and rebuild again and from this way the entire state will be reset
			setEditorKey((prevKey) => prevKey + 1);
			// editorRef?.current?.setContents([]);
		} catch (error) {
			toast.error("Faild to send message!")
		} finally {
			setIsPending(false);
			editorRef?.current?.enable(true);
		}

	};

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
