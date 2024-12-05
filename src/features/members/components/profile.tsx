import Link from 'next/link';
import { AlertTriangleIcon, ChevronDown, Loader, MailIcon, XIcon } from 'lucide-react';

import { useConfirm } from '@/hooks/use-confirm';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { useGetMember } from '../api/use-get-member';
import { useUpdateMember } from '../api/use-update-member';
import { useDeleteMember } from '../api/use-delete-member';
import { useCurrentMember } from '../api/use-current-member';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { Id } from '../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
};

export const Profile = ({
  memberId,
  onClose
}: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });

  const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({ workspaceId });
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
  const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();

  const isPending = isUpdatingMember || isDeletingMember;

  const avatarFallback = member?.user.name?.[0] ?? "M";

  const [DeleteDialog, confirmDeleting] = useConfirm(
    `Delete ${member?.user?.name}?`,
    `Are you sure to delete ${member?.user?.name}? this action cannot be undone.`
  );

  const [LeaveDialog, confirmLeaveDialog] = useConfirm(
    'Leave workspace',
    'Are you sure you want to leave this workspace?'
  );
  const [UpdateDialog, confirmUpdateDialog] = useConfirm(
    `Update ${member?.user?.name} role?`,
    `Are you sure to update ${member?.user?.name} role?`
  );

  const onDelete = async () => {
    const ok = await confirmDeleting();

    if (!ok) return;

    deleteMember({ id: memberId }, {
      onSuccess: () => {
        toast.success("Member deleted");
        onClose();
      },
      onError: () => {
        toast.error("Faild to delete member")
      }
    })
  };

  const onLeave = async () => {
    const ok = await confirmLeaveDialog();

    if (!ok) return;

    deleteMember({ id: memberId }, {
      onSuccess: () => {
        router.replace('/');
        toast.success("You left the workspace");
        onClose();
      },
      onError: () => {
        toast.error("Faild to leave the workspace")
      }
    })
  };

  const onUpdate = async (role: 'admin' | 'member') => {
    const ok = await confirmUpdateDialog();

    if (!ok) return;

    updateMember({
      id: memberId,
      role
    },
      {
        onSuccess: () => {
          toast.success("Member role updted");
          onClose();
        },
        onError: () => {
          toast.error("Faild to update member role")
        }
      });
  };


  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="h-full flex flex-col">
        <ProfileHeader onClose={onClose} />
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
        </div>
      </div>
    )
  };

  if (!member) {
    return (
      <div className="h-full flex flex-col">
        <ProfileHeader onClose={onClose} />
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <AlertTriangleIcon className='size-5 text-muted-foreground' />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }
  return (
    <>
      <DeleteDialog />
      <LeaveDialog />
      <UpdateDialog />

      <div className="h-full flex flex-col">
        <ProfileHeader onClose={onClose} />
        <div className='flex flex-col items-center justify-center p-4'>
          <Avatar className='max-w-[256px] max-h-[256px] size-full'>
            <AvatarImage
              src={member?.user.image}
              alt={member?.user.name}
            />
            <AvatarFallback className='aspect-square text-6xl'>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member?.user.name}</p>
          {currentMember?.role === 'admin' &&
            /* IF WE ARE LOOKING FOR ANYONE ELSE */
            currentMember?._id !== memberId ? (
            <div className='flex items-center gap-2 mt-4'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full capitalize'
                  >
                    {member.role} <ChevronDown className='size-4 ml-2' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-full'>
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) => onUpdate(role as 'admin' | 'member')}
                  >
                    <DropdownMenuRadioItem value='admin'>
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value='member'>
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant='destructive'
                className='w-full'
                onClick={onDelete}
              >
                Remove
              </Button>
            </div>
          ) :
            /* IF WE ARE LOOKING FOR OURSELFS */
            currentMember?._id === memberId &&
              currentMember?.role !== 'admin' ? (
              <div>
                <Button
                  className='w-full'
                  variant='outline'
                  onClick={onLeave}
                >
                  Leave
                </Button>
              </div>
            )
              : null
          }
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4">Contact Information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <MailIcon className='size-4' />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email address
              </p>
              <Link
                href={`mailto:${member?.user.email}`}
                className='text-sm hover:underline text-[#1264a3]'>
                {member?.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

const ProfileHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex justify-between items-center h-[49px] px-2 border-b">
      <p className="text-lg font-bold">Profile</p>
      <Button onClick={onClose} size='iconSm' variant='ghost'>
        <XIcon className='size-5 stroke-[1.5]' />
      </Button>
    </div>
  )
};