import { MessageSquareTextIcon, PencilIcon, SmileIcon, TrashIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Hint } from './hint';
import { EmojiPopover } from './emoji-popover';

interface ToolbarProps {
  isAuthor: boolean;
  isAdmin: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  handleThread: () => void;
  handleReaction: (value: string) => void;
  handleAdminDeleteMessage: () => void,
  hideThreadButton?: boolean;
};

export const Toolbar = ({
  isAuthor,
  isAdmin,
  isPending,
  handleEdit,
  handleDelete,
  handleThread,
  handleReaction,
  hideThreadButton,
  handleAdminDeleteMessage
}: ToolbarProps) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover
          hint='Add reaction'
          onEmojiSelect={(emoji) => handleReaction(emoji)}
        >
          <Button
            variant='ghost'
            size="iconSm"
            disabled={isPending}
          >
            <SmileIcon className='size-4' />
          </Button>
        </EmojiPopover>

        {!hideThreadButton && (
          <Hint label='Reply in thread'>
            <Button
              variant='ghost'
              size="iconSm"
              disabled={isPending}
              onClick={handleThread}
            >
              <MessageSquareTextIcon className='size-4' />
            </Button>
          </Hint>
        )}

        {isAuthor &&
          (
            <Hint label='Edit message'>
              <Button
                variant='ghost'
                size="iconSm"
                disabled={isPending}
                onClick={handleEdit}
              >
                <PencilIcon className='size-4' />
              </Button>
            </Hint>
          )}

        {(isAuthor || isAdmin) && (
          <Hint label='Delete message'>
            <Button
              variant='ghost'
              size="iconSm"
              disabled={isPending}
              onClick={isAdmin ? handleAdminDeleteMessage : handleDelete}
            >
              <TrashIcon className='size-4' />
            </Button>
          </Hint>
        )}

      </div>
    </div>
  )
}

