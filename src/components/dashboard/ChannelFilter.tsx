import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useDashboardStore } from '../../store/dashboard';
import { X } from 'lucide-react';

const AVAILABLE_CHANNELS = ['email', 'linkedin'];

export function ChannelFilter() {
  const { filters, setChannels } = useDashboardStore();

  const toggleChannel = (channel: string) => {
    const newChannels = filters.channels.includes(channel)
      ? filters.channels.filter(c => c !== channel)
      : [...filters.channels, channel];
    setChannels(newChannels);
  };

  const clearAllChannels = () => {
    setChannels([]);
  };

  const selectAllChannels = () => {
    setChannels(AVAILABLE_CHANNELS);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Channels:</span>
      
      {AVAILABLE_CHANNELS.map(channel => (
        <Badge
          key={channel}
          variant={filters.channels.includes(channel) ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => toggleChannel(channel)}
        >
          {channel}
          {filters.channels.includes(channel) && (
            <X className="ml-1 h-3 w-3" />
          )}
        </Badge>
      ))}

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAllChannels}
          className="text-xs h-6"
        >
          All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllChannels}
          className="text-xs h-6"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}