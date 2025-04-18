import Image from 'next/image';

import {
	MutableRefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react';

import { PiTextAa } from 'react-icons/pi';
import { MdSend } from 'react-icons/md';
import {
	ImageIcon,
	SmileIcon,
	XIcon
} from 'lucide-react';

import 'quill/dist/quill.snow.css';
import { Delta, Op } from 'quill/core';
import Quill, { type QuillOptions } from 'quill';

import { Hint } from './hint';
import { EmojiPopover } from './emoji-popover';

import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type EditorValue = {
	image: File | null;
	body: string;
};

interface EditorProps {
	onSubmit: ({ image, body }: EditorValue) => void;
	onCancel?: () => void;
	placeholder?: string;
	defaultValue?: Delta | Op[];
	disabled?: boolean;
	innerRef?: MutableRefObject<Quill | null>;
	variant?: 'create' | 'update';
}

const Editor = ({
	variant = 'create',
	onSubmit,
	onCancel,
	disabled = false,
	defaultValue = [],
	placeholder = 'Write somthing...',
	innerRef,
}: EditorProps) => {
	const [text, setText] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [isToolbarVisible, setIsToolbarVisible] = useState(true);

	// why we rely on refs? thats because refs do not be added to dependency array and do not cause rerender on change
	const containerRef = useRef<HTMLDivElement>(null);
	const submitRef = useRef(onSubmit);
	const placeholderRef = useRef(placeholder);
	const quillRef = useRef<Quill | null>(null);
	const defaultValueRef = useRef(defaultValue);
	const disabledRef = useRef(disabled);
	const imageElementRef = useRef<HTMLInputElement>(null);

	useLayoutEffect(() => {
		// update all of refs if it have new values
		submitRef.current = onSubmit;
		placeholderRef.current = placeholder;
		defaultValueRef.current = defaultValue;
		disabledRef.current = disabled;
	});

	useEffect(() => {
		if (!containerRef?.current) return;

		const container = containerRef?.current;
		const editorContainer = container.appendChild(container.ownerDocument.createElement('div'));

		const options: QuillOptions = {
			theme: 'snow',
			placeholder: placeholderRef.current,
			modules: {
				toolbar: [
					['bold', 'italic', 'strike', 'underline'],
					['link'],
					['blockquote', 'code-block'],
					[{ list: 'ordered' }, { list: 'bullet' }],
				],
				keyboard: {
					bindings: {
						enter: {
							key: 'Enter',
							handler: () => {
								// used ref because if we pass image directly from state that make us put it on dependency array and that mean rerender
								const text = quill.getText()
								const addedImage = imageElementRef.current?.files?.[0] || null;
								const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

								// that means user truly has not type anything nor added any image
								if (isEmpty) return;

								const body = JSON.stringify(quill.getContents());

								submitRef.current?.({ body, image: addedImage });
							},
						},
						shift_enter: {
							key: 'Enter',
							shiftKey: true,
							handler: () => {
								quill.insertText(quill.getSelection()?.index || 0, '\n');
							},
						},
					},
				},
			},
		};

		const quill = new Quill(editorContainer, options);
		quillRef.current = quill; // to exist quill through the code not only on use effect
		quillRef.current.focus();

		// thats means obviously want to controll the quill editor in the same way from outside of the editor component
		if (innerRef) {
			innerRef.current = quill;
		}

		quill.setContents(defaultValueRef.current);
		setText(quill.getText());
		// only refresh the text on every key stroke change
		quill.on(Quill.events.TEXT_CHANGE, () => {
			setText(quill.getText());
		});

		return () => {
			quill.off(Quill.events.TEXT_CHANGE);

			if (container) {
				container.innerHTML = '';
			}

			if (quillRef.current) {
				quillRef.current = null;
			}
			if (innerRef) {
				innerRef.current = null;
			}
		};
	}, [innerRef]);

	const isEmpty = !image && text.trim().length === 0;

	const toggleToolbar = () => {
		setIsToolbarVisible(current => !current);

		const toolbarElement = containerRef.current?.querySelector('.ql-toolbar');
		if (toolbarElement) {
			toolbarElement.classList.toggle('hidden');
		}
	};

	const onEmojiSelect = (emojiValue: string) => {
		const quill = quillRef.current;

		quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
	};


	return (
		<div className='flex flex-col'>
			{/* phantom input */}
			<input
				type='file'
				accept='image/*'
				ref={imageElementRef}
				onChange={(event) => setImage(event.target.files![0])}
				className='hidden'
			/>

			<div className={cn(
				'flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white',
				disabled && "opacity-50"
			)}>
				<div
					ref={containerRef}
					className='h-full ql-custom'
				/>
				{!!image && (
					<div className='p-2'>
						<div className="relative size-[62px] flex items-center justify-center group/image">
							<Hint label='Remove image'>
								<button
									onClick={() => {
										setImage(null);
										imageElementRef.current!.value = "";
									}}
									className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
								>
									<XIcon className='size-3.5' />
								</button>
							</Hint>

							<Image
								src={URL.createObjectURL(image)}
								alt="Uploaded"
								fill
								className='rounded-xl overflow-hidden border object-cover'
							/>
						</div>
					</div>
				)}
				<div className='flex px-2 pb-2 z-[5]'>
					<Hint label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}>
						<Button
							variant='ghost'
							size='sm'
							disabled={disabled}
							onClick={toggleToolbar}>
							<PiTextAa className='size-4' />
						</Button>
					</Hint>

					<EmojiPopover onEmojiSelect={onEmojiSelect}>
						<Button
							variant='ghost'
							size='sm'
							disabled={disabled}
						>
							<SmileIcon className='size-4' />
						</Button>
					</EmojiPopover>

					{variant === 'create' && (
						<Hint label='Upload image'>
							<Button
								variant='ghost'
								size='sm'
								disabled={disabled}
								onClick={() => imageElementRef.current?.click()}>
								<ImageIcon className='size-4' />
							</Button>
						</Hint>
					)}

					{variant === 'update' && (
						<div className='ml-auto flex items-center gap-x-2'>
							<Button
								variant='outline'
								size='sm'
								disabled={disabled}
								onClick={onCancel}>
								Cancel
							</Button>

							<Button
								disabled={disabled || isEmpty}
								onClick={() => {
									onSubmit({
										body: JSON.stringify(quillRef.current?.getContents()),
										image,
									})
								}}
								size='sm'
								className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'>
								Save
							</Button>
						</div>
					)}

					{variant === 'create' && (
						<Button
							disabled={disabled || isEmpty}
							size='iconSm'
							onClick={() => {
								onSubmit({
									body: JSON.stringify(quillRef.current?.getContents()),
									image,
								})
							}}
							className={cn(
								'ml-auto',
								isEmpty
									? 'bg-white hover:bg-white text-muted-foreground'
									: 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
							)}>
							<MdSend className='size-4' />
						</Button>
					)}
				</div>
			</div>

			{variant === "create" &&
				(<div className={cn(
					'p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition',
					!isEmpty && "opacity-100"
				)}>
					<p>
						<strong>Shift + Return</strong> to add a new line
					</p>
				</div>
				)}
		</div>
	);
};
export default Editor;
