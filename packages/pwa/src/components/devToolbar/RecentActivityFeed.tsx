import type React from 'react';

import {IconName} from '@shared/types/icons.types';
import {ViewType} from '@shared/types/views.types';

import {useEventLogItems} from '@sharedClient/services/eventLog.client';

import {formatRelativeTime} from '@sharedClient/lib/time.client';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
// Import Popover components and ButtonIcon
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {Text} from '@src/components/atoms/Text';

export const RecentActivityFeed: React.FC = () => {
  // Use ViewType.All - might need adjustment based on hook/service needs
  const {eventLogItems, isLoading, error} = useEventLogItems({viewType: ViewType.All});

  // Still render nothing if loading/error/empty in dev mode
  // TODO: Add !IS_DEVELOPMENT check
  if (isLoading || error || eventLogItems.length === 0) {
    return null;
  }

  return (
    // Use Popover component
    <Popover>
      <PopoverTrigger asChild>
        {/* Use an icon button as the trigger */}
        <ButtonIcon
          name={IconName.Inbox}
          tooltip="Recent Activity"
          size={32}
          onClick={() => {
            /* Radix handles popover via asChild */
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[350px]" align="end">
        <div className="flex flex-col gap-2">
          <Text as="h4" bold className="mb-1">
            Recent Activity
          </Text>
          <ul className="flex max-h-[400px] flex-col gap-1 overflow-y-auto text-sm">
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
