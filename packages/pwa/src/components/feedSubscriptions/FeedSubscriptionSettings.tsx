import {useCallback} from 'react';

import {
  IMMEDIATE_DELIVERY_SCHEDULE,
  makeDaysAndTimesOfWeekDeliverySchedule,
  makeEveryNHoursDeliverySchedule,
  NEVER_DELIVERY_SCHEDULE,
} from '@shared/lib/deliverySchedules.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever, noop} from '@shared/lib/utils.shared';

import {parseDeliveryScheduleType} from '@shared/parsers/deliverySchedules.parser';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {DayOfWeek} from '@shared/types/datetime.types';
import {DeliveryScheduleType} from '@shared/types/deliverySchedules.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  UserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

import {toast} from '@sharedClient/lib/toasts.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';
import {useUserFeedSubscriptionsService} from '@sharedClient/hooks/userFeedSubscriptions.hooks';

import {Button} from '@src/components/atoms/Button';
import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Label} from '@src/components/atoms/Label';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {P} from '@src/components/atoms/Text';

import {firebaseService} from '@src/lib/firebase.pwa';

const FeedSubscriptionDeliveryScheduleSetting: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  const feedSubscriptionsService = useUserFeedSubscriptionsService({firebaseService});
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleDeliveryScheduleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ): Promise<void> => {
    setPending();

    const deliveryScheduleTypeResult = parseDeliveryScheduleType(event.target.value);
    if (!deliveryScheduleTypeResult.success) {
      setError(deliveryScheduleTypeResult.error);
      return;
    }

    let makeDeliveryScheduleResult: Result<DeliverySchedule, Error>;
    switch (deliveryScheduleTypeResult.value) {
      case DeliveryScheduleType.Immediate:
        makeDeliveryScheduleResult = makeSuccessResult(IMMEDIATE_DELIVERY_SCHEDULE);
        break;
      case DeliveryScheduleType.Never:
        makeDeliveryScheduleResult = makeSuccessResult(NEVER_DELIVERY_SCHEDULE);
        break;
      case DeliveryScheduleType.DaysAndTimesOfWeek:
        // TODO: Allow user to specify days and times.
        makeDeliveryScheduleResult = makeDaysAndTimesOfWeekDeliverySchedule({
          days: [DayOfWeek.Monday, DayOfWeek.Tuesday],
          times: [
            {hour: 8, minute: 0},
            {hour: 12, minute: 0},
            {hour: 16, minute: 0},
          ],
        });
        break;
      case DeliveryScheduleType.EveryNHours:
        // TODO: Allow user to specify hours.
        makeDeliveryScheduleResult = makeEveryNHoursDeliverySchedule({
          hours: 12,
        });
        break;
      default:
        assertNever(deliveryScheduleTypeResult.value);
    }

    if (!makeDeliveryScheduleResult.success) {
      setError(makeDeliveryScheduleResult.error);
      return;
    }

    const updateDeliveryScheduleResult = await feedSubscriptionsService.updateSubscription(
      userFeedSubscription.userFeedSubscriptionId,
      {deliverySchedule: makeDeliveryScheduleResult.value}
    );

    if (!updateDeliveryScheduleResult.success) {
      setError(updateDeliveryScheduleResult.error);
      return;
    }

    setSuccess(undefined);
  };

  let footer: React.ReactNode | null;
  switch (asyncState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
    case AsyncStatus.Success:
      footer = null;
      break;
    case AsyncStatus.Error:
      footer = <P error>{asyncState.error.message}</P>;
      break;
    default:
      assertNever(asyncState);
  }

  return (
    <FlexRow gap={2} justify="between">
      <Label htmlFor="deliverySchedule">Delivery schedule</Label>
      <select
        id="deliverySchedule"
        value={userFeedSubscription.deliverySchedule.scheduleType}
        onChange={handleDeliveryScheduleChange}
        className="border-neutral-3 rounded border p-1 text-sm"
      >
        <option value={DeliveryScheduleType.Immediate}>Immediately</option>
        <option value={DeliveryScheduleType.Never}>Never</option>
        <option value={DeliveryScheduleType.DaysAndTimesOfWeek}>Days and times of week</option>
        <option value={DeliveryScheduleType.EveryNHours}>Every N Hours</option>
      </select>
      {footer}
    </FlexRow>
  );
};

const FeedSubscriptionUnsubscribeButton: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  const eventLogService = useEventLogService({firebaseService});
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService({firebaseService});

  const {userFeedSubscriptionId} = userFeedSubscription;
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleToggleSubscription = useCallback(async (): Promise<void> => {
    setPending();

    let result: Result<void, Error>;
    if (userFeedSubscription.isActive) {
      result = await userFeedSubscriptionsService.updateSubscription(userFeedSubscriptionId, {
        isActive: false,
        unsubscribedTime: new Date(),
      });
    } else {
      result = await userFeedSubscriptionsService.updateSubscription(userFeedSubscriptionId, {
        isActive: true,
      });
    }

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (userFeedSubscription.isActive) {
      // Toast.
      toast('Unsubscribed from feed');

      // Log.
      void eventLogService.logUnsubscribedFromFeedSourceEvent({
        feedSourceType: userFeedSubscription.feedSourceType,
        userFeedSubscriptionId: userFeedSubscriptionId,
      });
    } else {
      // Toast.
      toast('Re-subscribed to feed');

      // Log.
      void eventLogService.logSubscribedToFeedSourceEvent({
        feedSourceType: userFeedSubscription.feedSourceType,
        userFeedSubscriptionId: userFeedSubscriptionId,
        isNewSubscription: false,
      });
    }

    setSuccess(undefined);
  }, [
    setPending,
    userFeedSubscription.isActive,
    userFeedSubscription.feedSourceType,
    setSuccess,
    userFeedSubscriptionsService,
    userFeedSubscriptionId,
    setError,
    eventLogService,
  ]);

  let footer: React.ReactNode | null;
  switch (asyncState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
    case AsyncStatus.Success:
      footer = null;
      break;
    case AsyncStatus.Error:
      footer = <P error>{asyncState.error.message}</P>;
      break;
    default:
      assertNever(asyncState);
  }

  return (
    <FlexRow gap={2} justify="between">
      <Label htmlFor="deliverySchedule">
        Subscription {userFeedSubscription.isActive ? 'active' : 'inactive'}
      </Label>

      <Button variant="outline" onClick={handleToggleSubscription}>
        {userFeedSubscription.isActive ? 'Unsubscribe' : 'Subscribe'}
      </Button>

      {footer}
    </FlexRow>
  );
};

const FeedSubscriptionIntervalSetting: React.FC<{
  readonly userFeedSubscription: IntervalUserFeedSubscription;
}> = ({userFeedSubscription}) => {
  // TODO: Make this configurable.
  return <div>Interval setting: {userFeedSubscription.intervalSeconds} seconds</div>;
};

const FeedSubscriptionSettingsPopoverContent: React.FC<{
  readonly userFeedSubscription: UserFeedSubscription;
}> = ({userFeedSubscription}) => {
  return (
    <PopoverContent className="w-auto" align="end" side="bottom">
      <FlexColumn gap={4} padding={4}>
        <FeedSubscriptionDeliveryScheduleSetting userFeedSubscription={userFeedSubscription} />
        <FeedSubscriptionUnsubscribeButton userFeedSubscription={userFeedSubscription} />
        {userFeedSubscription.feedSourceType === FeedSourceType.Interval ? (
          <FeedSubscriptionIntervalSetting userFeedSubscription={userFeedSubscription} />
        ) : null}
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
