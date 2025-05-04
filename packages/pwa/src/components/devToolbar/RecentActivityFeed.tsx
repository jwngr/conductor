import type React from 'react';

import {noop} from '@shared/lib/utils.shared';

import {IconName} from '@shared/types/icons.types';

import {useEventLogItems} from '@sharedClient/services/eventLog.client';

import {formatRelativeTime} from '@sharedClient/lib/time.client';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {Text} from '@src/components/atoms/Text';

export const RecentActivityFeed: React.FC = () => {
  const {eventLogItems, isLoading, error} = useEventLogItems();

  if (error) {
    return <Text className="text-error">Error loading recent activity: {error.message}</Text>;
  }

  if (isLoading) {
    return <Text light>Loading...</Text>;
  }

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
            Recent Activity
          </Text>
          <ul className="flex max-h-[400px] flex-col gap-1 overflow-y-auto">
            {eventLogItems.map((item) => (
              <li key={item.eventId} className="border-border bg-background rounded border p-1">
                <div className="flex justify-between">
                  <Text bold>{item.eventType}</Text>
                  <Text light title={item.createdTime.toISOString()}>
                    {formatRelativeTime(item.createdTime)}
                  </Text>
                </div>
                <pre className="text-foreground text-xs break-all whitespace-pre-wrap">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
