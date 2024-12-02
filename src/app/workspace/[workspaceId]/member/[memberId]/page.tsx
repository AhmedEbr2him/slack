'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation';

import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import type { Id } from '../../../../../../convex/_generated/dataModel';

const MemberIdPage = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

  const { mutate, isPending } = useCreateOrGetConversation();

  console.log({ conversationId });

  useEffect(() => {
    mutate({
      workspaceId,
      memberId,
    }, {
      onSuccess: (data) => {
        setConversationId(data)
      },
      onError: () => {
        toast.error("Faild to create or get conversation");
      }
    })
  }, [workspaceId, memberId, mutate]);

  if (isPending) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    );
  };

  if (!conversationId) {
    return (
      <div className='h-full flex flex-col gap-y-2 items-center justify-center'>
        <AlertTriangle className='size-6 text-muted-foreground' />
        <span className="text-sm text-muted-foreground">
          Conversation not found!
        </span>
      </div>
    );
  };

  return (
    <div className="">
      {JSON.stringify({ conversationId })}
    </div>
  )
};

export default MemberIdPage;