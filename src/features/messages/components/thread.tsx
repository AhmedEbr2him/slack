import { AlertTriangleIcon, Loader, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Message } from '@/components/message';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useGetMessage } from '@/features/messages/api/use-get-message';
import { useCurrentMember } from '@/features/members/api/use-current-member';

import type { Id } from '../../../../convex/_generated/dataModel';
import { useState } from 'react';

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
};

export const Thread = ({
  messageId,
  onClose
}: ThreadProps) => {
  const workspaceId = useWorkspaceId();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: isMessageLoading } = useGetMessage({ id: messageId });


  if (isMessageLoading) {
    return (
      <div className="h-full flex flex-col">
        <ThreadHeader onClose={onClose} />
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  };

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <ThreadHeader onClose={onClose} />
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <AlertTriangleIcon className='size-5 text-muted-foreground' />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col">
      <ThreadHeader onClose={onClose} />
      <Message
        hideThreadButton
        memberId={message.memberId}
        authorImage={message.user.image}
        authorName={message.user.name}
        isAuthor={message.memberId === currentMember?._id}
        body={message.body}
        image={message.image}
        createdAt={message._creationTime}
        updatedAt={message.updatedAt}
        id={message._id}
        reactions={message.reactions}
        isEditing={editingId === message._id}
        setEditingId={setEditingId}
      />
    </div>
  )
};

const ThreadHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex justify-between items-center h-[49px] px-2 border-b">
      <p className="text-lg font-bold">Thread</p>
      <Button onClick={onClose} size='iconSm' variant='ghost'>
        <XIcon className='size-5 stroke-[1.5]' />
      </Button>
    </div>
  )
}