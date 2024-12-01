import { format } from "date-fns";


interface ChannelHeroProps {
  channelName: string;
  channelCreationTime: number;
};

export const ChannelHero = ({
  channelName,
  channelCreationTime
}: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2">
        # {channelName}
      </p>
      <p className="font-normal text-slate-800 mb-4">
        This channel was created on {format(channelCreationTime, "MMM do, yyyy")}. This is the very begining of the <strong>{channelName}</strong> channel.
      </p>
    </div>
  )
}