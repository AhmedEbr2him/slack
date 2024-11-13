import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PiTextAa } from 'react-icons/pi';
import { MdSend } from 'react-icons/md';
import { Image, Smile } from 'lucide-react';

import 'quill/dist/quill.snow.css';
import { Delta, Op } from 'quill/core';
import Quill, { type QuillOptions } from 'quill';

import { Hint } from './hint';
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
	const [isToolbarVisible, setIsToolbarVisible] = useState(true);

	// why we rely on refs? thats because refs do not be added to dependency array and do not cause rerender on change
	const containerRef = useRef<HTMLDivElement>(null);
	const submitRef = useRef(onSubmit);
	const placeholderRef = useRef(placeholder);
	const quillRef = useRef<Quill | null>(null);
	const defaultValueRef = useRef(defaultValue);
	const disabledRef = useRef(disabled);

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
								// TODO: SUBMIT FORM
								return;
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

	const isEmpty = text.trim().length === 0;

	const toggleToolbar = () => {
		setIsToolbarVisible(current => !current);

		const toolbarElement = containerRef.current?.querySelector('.ql-toolbar');
		if (toolbarElement) {
			toolbarElement.classList.toggle('hidden');
		}
	};

	return (
		<div className='flex flex-col'>
			<div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
				<div
					ref={containerRef}
					className='h-full ql-custom'
				/>

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

					<Hint label='Emoji'>
						<Button
							variant='ghost'
							size='sm'
							disabled={disabled}
							onClick={() => {}}>
							<Smile className='size-4' />
						</Button>
					</Hint>

					{variant === 'create' && (
						<Hint label='Upload image'>
							<Button
								variant='ghost'
								size='sm'
								disabled={disabled}
								onClick={() => {}}>
								<Image className='size-4' />
							</Button>
						</Hint>
					)}

					{variant === 'update' && (
						<div className='ml-auto flex items-center gap-x-2'>
							<Button
								variant='outline'
								size='sm'
								disabled={disabled}
								onClick={() => {}}>
								Cancel
							</Button>

							<Button
								disabled={disabled || isEmpty}
								onClick={() => {}}
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
							onClick={() => {}}
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

			<div className='p-2 text-[10px] text-muted-foreground flex justify-end'>
				<p className=''>
					<strong>Shift + Return</strong> to add a new line
				</p>
			</div>
		</div>
	);
};
export default Editor;
