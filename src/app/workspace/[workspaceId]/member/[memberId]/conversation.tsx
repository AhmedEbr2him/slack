import { Loader } from 'lucide-react';

import { useMemberId } from '@/hooks/use-member-id';
import { useChannelId } from '@/hooks/use-channel-id';

import type { Id } from '../../../../../../convex/_generated/dataModel';

import { Header } from './header';

import MessageList from '@/components/message-list';

import { useGetMember } from '@/features/members/api/use-get-member';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { ChatInput } from './chat-input';

interface ConversationProps {
  id: Id<"conversations">;
};

export const Conversation = ({ id }: ConversationProps) => {
  const channelId = useChannelId();
  const memberId = useMemberId();

  const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });

  const { results, status, loadMore } = useGetMessages({
    conversationId: id,
  });

  if (memberLoading || status === 'LoadingFirstPage') {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => { }}
      />
      <MessageList
        data={results}
        variant='conversation'
        memberName={member?.user.name}
        memberImage={member?.user.image}
        loadMore={loadMore}
        isLoadingMore={status === 'LoadingMore'}
        canLoadMore={status === 'CanLoadMore'}
      />
      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />

    </div>
  )
}