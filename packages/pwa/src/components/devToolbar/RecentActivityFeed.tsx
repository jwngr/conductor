import {formatRelativeTime} from '@shared/lib/datetime.shared';
import {assertNever, noop} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {EventLogItem} from '@shared/types/eventLog.types';
import {IconName} from '@shared/types/icons.types';

import {useEventLogItems} from '@sharedClient/services/eventLog.client';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {Text} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {LoadingArea} from '@src/components/loading/LoadingArea';

const RecentActivityFeedItem: React.FC<{
  readonly eventLogItem: EventLogItem;
}> = ({eventLogItem}) => {
  const {eventId, eventType, createdTime, data} = eventLogItem;

  return (
    <li key={eventId} className="border-border bg-background rounded border p-1">
      <div className="flex justify-between">
        <Text bold>{eventType}</Text>
        <Text light title={createdTime.toISOString()}>
          {formatRelativeTime(createdTime)}
        </Text>
      </div>
      <pre className="text-foreground text-xs break-all whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </li>
  );
};

const LoadedRecentActivityFeed: React.FC<{
  readonly eventLogItems: readonly EventLogItem[];
}> = ({eventLogItems}) => {
  if (eventLogItems.length === 0) {
    return <Text light>No recent activity</Text>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ButtonIcon
          name={IconName.Inbox}
          tooltip="Recent activity"
          size={32}
          onClick={noop} // Click handled via `asChild`.
        />
      </PopoverTrigger>

      <PopoverContent className="w-[350px]" align="end">
        <div className="flex flex-col gap-2">
          <Text as="h4" bold className="mb-1">
            Recent activity
          </Text>
          <ul className="flex max-h-[400px] flex-col gap-1 overflow-y-auto">
            {eventLogItems.map((item) => (
              <RecentActivityFeedItem key={item.eventId} eventLogItem={item} />
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const RecentActivityFeed: React.FC = () => {
  const eventLogItemsState = useEventLogItems();

  switch (eventLogItemsState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading recent activity..." />;
    case AsyncStatus.Error:
      return (
        <ErrorArea
          error={eventLogItemsState.error}
          title="Error loading activity"
          subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
          actions={[]}
        />
      );
    case AsyncStatus.Success:
      return <LoadedRecentActivityFeed eventLogItems={eventLogItemsState.value} />;
    default:
      assertNever(eventLogItemsState);
  }
};
