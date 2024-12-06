import dynamic from 'next/dynamic';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { format, isToday, isYesterday } from 'date-fns';

import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { useDeleteMessage } from '@/features/messages/api/use-delete-message';
import { useToggleReaction } from '@/features/reactions/api/use-toggle-reaction';

import { usePanel } from '@/hooks/use-panel';
import { useConfirm } from '@/hooks/use-confirm';

import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from './ui/avatar';
import { Hint } from './hint';
import { Toolbar } from './toolbar';
import { Thumbnail } from './thumbnail';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Reactions } from './reactions';
import { ThreadBar } from './thread-bar';
import { useAdminDeleteMessage } from '@/features/messages/api/use-admin-delete-message';
import { Wrench } from 'lucide-react';

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  isAdmin: boolean;
  role: string | undefined;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">['body'];
  image: string | null | undefined;
  createdAt: Doc<"messages">['_creationTime'];
  updatedAt: Doc<"messages">['updatedAt'];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadName?: string;
  threadImage?: string;
  threadTimestamp?: number;
};


const formatFullTime = (date: Date) => {
  return `${isToday(date)
    ? "Today"
    : isYesterday(date) ? "Yesterday"
      : format(date, "MMM d, yyyy")} at ${format(date, "hh:mm:ss a")}`
};

export const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  isAdmin,
  role,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

  const [ConfirmDialog, confirm] = useConfirm(
    'Delete message',
    "Are you sure to delete this message? This can not be undone",
  );

  const { mutate: updateMessage, isPending: isUpdateMessagePending } = useUpdateMessage();
  const { mutate: deleteMessage, isPending: isDeleteMessagePending } = useDeleteMessage();
  const { mutate: toggleReaction, isPending: isTogglingReactionPending } = useToggleReaction();
  const { mutate: adminDeleteMessage } = useAdminDeleteMessage();
  const isPending = isUpdateMessagePending || isTogglingReactionPending;

  console.log({ isAdmin });

  const avatarFallback = authorName.charAt(0).toLocaleUpperCase();

  const handleReaction = (value: string) => {
    toggleReaction({
      messageId: id,
      value,
    }, {
      onError: () => {
        toast.error("Faild to set reaction");
      },
    });
  };

  const handleUpdateMessage = ({ body }: { body: string }) => {
    updateMessage({ id, body }, {
      onSuccess: () => {
        toast.success("Message updated")
        setEditingId(null); // reset edit it
      },
      onError: () => {
        toast.error("Faild to update message")
      }
    })
  };

  const handleDeleteMessage = async () => {
    const ok = await confirm();

    if (!ok) return;

    deleteMessage({ id }, {
      onSuccess: () => {
        toast.success("Message deleted");

        if (parentMessageId === id) {
          onClose();
        }
      },
      onError: () => {
        toast.error("Faild to delete message")
      }
    })
  };

  const handleAdminDeleteMessage = async () => {
    const ok = await confirm();

    if (!ok) return;

    adminDeleteMessage({ id }, {
      onSuccess: () => {
        toast.success("Message deleted");

        if (parentMessageId === id) {
          onClose();
        }
      },
      onError: () => {
        toast.error("Faild to delete message")
      }
    })
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isDeleteMessagePending &&
          "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}>
          <div className='flex items-start gap-2'>
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className='text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline'>
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ?
              (
                <div className='w-full h-full'>
                  <Editor
                    onSubmit={handleUpdateMessage}
                    disabled={isPending}
                    defaultValue={JSON.parse(body)}
                    onCancel={() => setEditingId(null)}
                    variant='update'
                  />
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <Renderer value={body} />
                  <Thumbnail url={image} />
                  {updatedAt
                    ? <Hint
                      label={formatFullTime(new Date(updatedAt))}
                      align='start'
                    >
                      <span className='text-xs text-muted-foreground hover:underline cursor-default'>(edited)</span>
                    </Hint>
                    : null
                  }
                  <Reactions
                    data={reactions}
                    onChange={handleReaction}
                    disabled={isTogglingReactionPending}
                  />
                  <ThreadBar
                    count={threadCount}
                    image={threadImage}
                    name={threadName}
                    timestamp={threadTimestamp}
                    onClick={() => onOpenMessage(id)}
                  />
                </div>
              )}
          </div>

          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isAdmin={isAdmin}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleDeleteMessage}
              handleReaction={handleReaction}
              handleAdminDeleteMessage={handleAdminDeleteMessage}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    )
  };
  //http://localhost:3000/join/k5734df4d8acjbs5chn3bj5sfd74cr0y z8fdie
  return (
    <>
      <ConfirmDialog />
      <div className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
        isDeleteMessagePending &&
        "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
      )}>
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar className='size-8 mr-1'>
              <AvatarImage
                src={authorImage}
                alt={authorName}
              />
              <AvatarFallback>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>

          {isEditing ?
            (
              <div className='w-full h-full'>
                <Editor
                  onSubmit={handleUpdateMessage}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant='update'
                />
              </div>
            ) : (
              <div className='flex flex-col w-full overflow-hidden'>
                <div className='text-sm'>
                  <button
                    className='font-bold text-primary hover:underline flex items-center'
                    onClick={() => onOpenProfile(memberId)}
                  >
                    {isAdmin && <Wrench className='size-4 mr-1 text-muted-foreground' />}
                    {authorName}
                  </button>
                  <span className="">&nbsp;&nbsp;</span>
                  <Hint label={formatFullTime(new Date(createdAt))}>
                    <button className='text-xs text-muted-foreground hover:underline'>
                      {format(new Date(createdAt), "h:mm a")}
                    </button>
                  </Hint>
                </div>
                <Renderer value={body} />

                <Thumbnail url={image} />

                {updatedAt ? (
                  <Hint
                    label={formatFullTime(new Date(updatedAt))}
                    align='start'
                  >
                    <span className="text-xs text-muted-foreground hover:underline cursor-default">(edited)</span>
                  </Hint>
                ) : null}

                <Reactions
                  data={reactions}
                  onChange={handleReaction}
                  disabled={isTogglingReactionPending}
                />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
        </div>

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isAdmin={isAdmin}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDeleteMessage}
            handleAdminDeleteMessage={handleAdminDeleteMessage}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  )
}