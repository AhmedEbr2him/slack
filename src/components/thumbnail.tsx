import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";


interface ThumbnailProps {
  url: string | null | undefined;
};

export const Thumbnail = ({
  url
}: ThumbnailProps) => {
  if (!url) return null;

  return (
    <Dialog>
      <DialogTitle></DialogTitle>
      <DialogTrigger>
        <div className="relative overflow-hidden max-w-[360px] border rounded-lg my-2">
          <img
            src={url}
            alt="message-image"
            className='rounded-md object-cover size-full'
          />
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[800px] bg-transparent p-0 shadow-none'>
        <img
          src={url}
          alt="message-image"
          className='rounded-md object-cover size-full'
        />
      </DialogContent>
    </Dialog>
  )
}