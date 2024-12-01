import dynamic from 'next/dynamic';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { format, isToday, isYesterday } from 'date-fns';
import { Hint } from './hint';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from './ui/avatar';
import { Thumbnail } from './thumbnail';
import { Toolbar } from './toolbar';
import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
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
  threadTimestamp
}: MessageProps) => {
  const avatarFallback = authorName.charAt(0).toLocaleUpperCase();

  const { mutate: updateMessage, isPending: isUpdateMessagePending } = useUpdateMessage();

  const isPending = isUpdateMessagePending;

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
  }
  if (isCompact) {
    return (
      <div className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
      )}>
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
            <div className='flex items-start gap-2'>
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className='text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline'>
                  {format(new Date(createdAt), "hh:mm")}
                </button>
              </Hint>
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
              </div>
            </div>
          )}

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => { }}
            handleDelete={() => { }}
            handleReaction={() => { }}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    )
  };

  return (
    <div className={cn(
      "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
      isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
    )}>

      <div className="flex items-start gap-2">
        <button>
          <Avatar className='size-8 mr-1'>
            {authorImage && (
              <AvatarImage
                src={authorImage}
                alt={authorName}
              />
            )}
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
                  className='font-bold text-primary hover:underline'
                  onClick={() => { }}
                >
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
            </div>)}
      </div>

      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isPending}
          handleEdit={() => setEditingId(id)}
          handleThread={() => { }}
          handleDelete={() => { }}
          handleReaction={() => { }}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  )
}