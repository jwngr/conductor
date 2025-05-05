import {useCallback, useState} from 'react';

import {makeSuccessResult} from '@shared/lib/results.shared';
import {noop} from '@shared/lib/utils.shared';

import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import {IconName} from '@shared/types/icons.types';
import {Result} from '@shared/types/results.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button} from '@src/components/atoms/Button';
import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {Text} from '@src/components/atoms/Text';

const FeedSubscriptionDeliveryScheduleSetting: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  const handleDeliveryScheduleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    console.log('+++ handleDeliveryScheduleChange:', event.target.value);
  };

  return (
    <FlexRow gap={2} justify="between">
      <label htmlFor="deliverySchedule" className="text-sm font-medium">
        Delivery schedule
      </label>
      <select
        id="deliverySchedule"
        value={userFeedSubscription.deliverySchedule.toString()}
        onChange={handleDeliveryScheduleChange}
        className="border-neutral-3 rounded border p-1 text-sm"
      >
        <option value={DeliveryScheduleType.Immediate}>Immediately</option>
        <option value={DeliveryScheduleType.Never}>Never</option>
        <option value={DeliveryScheduleType.DaysAndTimesOfWeek}>Days and times of week</option>
        <option value={DeliveryScheduleType.EveryNHours}>Every N Hours</option>
      </select>
    </FlexRow>
  );
};

const FeedSubscriptionUnsubscribeButton: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  const [manageSubscriptionError, setManageSubscriptionError] = useState<Error | null>(null);
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const handleToggleSubscription = useCallback(async (): Promise<void> => {
    let result: Result<void, Error>;
    if (userFeedSubscription.isActive) {
      result = await userFeedSubscriptionsService.updateSubscription(
        userFeedSubscription.userFeedSubscriptionId,
        {isActive: false, unsubscribedTime: new Date()}
      );
    } else {
      result = await userFeedSubscriptionsService.updateSubscription(
        userFeedSubscription.userFeedSubscriptionId,
        {isActive: true}
      );
    }

    if (!result.success) {
      setManageSubscriptionError(result.error);
      return;
    }
  }, [
    userFeedSubscription.isActive,
    userFeedSubscription.userFeedSubscriptionId,
    userFeedSubscriptionsService,
  ]);

  return (
    <FlexRow gap={2} justify="between">
      <label htmlFor="deliverySchedule" className="text-sm font-medium">
        Subscription {userFeedSubscription.isActive ? 'active' : 'inactive'}
      </label>

      <Button variant="outline" onClick={handleToggleSubscription}>
        {userFeedSubscription.isActive ? 'Unsubscribe' : 'Subscribe'}
      </Button>

      {manageSubscriptionError ? (
        <Text as="p" className="text-error">
          {manageSubscriptionError.message}
        </Text>
      ) : null}
    </FlexRow>
  );
};

const FeedSubscriptionSettingsPopoverContent: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  return (
    <PopoverContent className="w-auto" align="end" side="bottom">
      <FlexColumn gap={4} padding={4}>
        <FeedSubscriptionDeliveryScheduleSetting userFeedSubscription={userFeedSubscription} />
        <FeedSubscriptionUnsubscribeButton userFeedSubscription={userFeedSubscription} />
      </FlexColumn>
    </PopoverContent>
  );
};

export const FeedSubscriptionSettingsButton: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <ButtonIcon
          name={IconName.SlidersHorizontal}
          size={32}
          tooltip="Customize subscription"
          onClick={noop}
        />
      </PopoverTrigger>

      <FeedSubscriptionSettingsPopoverContent userFeedSubscription={userFeedSubscription} />
    </Popover>
  );
};
