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
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  FeedSubscription,
  IntervalFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';

import {useFeedSubscriptionsStore} from '@sharedClient/stores/FeedSubscriptionsStore';

import {toast} from '@sharedClient/lib/toasts.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

import {Button} from '@src/components/atoms/Button';
import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Label} from '@src/components/atoms/Label';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';
import {P} from '@src/components/atoms/Text';

import {firebaseService} from '@src/lib/firebase.pwa';

const FeedSubscriptionDeliveryScheduleSetting: React.FC<{
  readonly feedSubscription: FeedSubscription;
}> = ({feedSubscription}) => {
  const {feedSubscriptionsService} = useFeedSubscriptionsStore();
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleDeliveryScheduleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ): Promise<void> => {
    if (!feedSubscriptionsService) {
      setError(new Error('Feed subscriptions service not found'));
      return;
    }

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
      feedSubscription.feedSubscriptionId,
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
        value={feedSubscription.deliverySchedule.scheduleType}
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
  readonly feedSubscription: FeedSubscription;
}> = ({feedSubscription}) => {
  const eventLogService = useEventLogService({firebaseService});
  const {feedSubscriptionsService} = useFeedSubscriptionsStore();

  const {feedSubscriptionId} = feedSubscription;
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleToggleSubscription = useCallback(async (): Promise<void> => {
    if (!feedSubscriptionsService) {
      setError(new Error('Feed subscriptions service not found'));
      return;
    }

    setPending();

    let result: Result<void, Error>;
    if (feedSubscription.isActive) {
      result = await feedSubscriptionsService.updateSubscription(feedSubscriptionId, {
        isActive: false,
        unsubscribedTime: new Date(),
      });
    } else {
      result = await feedSubscriptionsService.updateSubscription(feedSubscriptionId, {
        isActive: true,
      });
    }

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (feedSubscription.isActive) {
      // Toast.
      toast('Unsubscribed from feed');

      // Log.
      void eventLogService.logUnsubscribedFromFeedEvent({
        feedType: feedSubscription.feedType,
        feedSubscriptionId,
      });
    } else {
      // Toast.
      toast('Re-subscribed to feed');

      // Log.
      void eventLogService.logSubscribedToFeedEvent({
        feedType: feedSubscription.feedType,
        feedSubscriptionId,
        isNewSubscription: false,
      });
    }

    setSuccess(undefined);
  }, [
    setPending,
    feedSubscription.isActive,
    feedSubscription.feedType,
    setSuccess,
    feedSubscriptionsService,
    feedSubscriptionId,
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
        Subscription {feedSubscription.isActive ? 'active' : 'inactive'}
      </Label>

      <Button variant="outline" onClick={handleToggleSubscription}>
        {feedSubscription.isActive ? 'Unsubscribe' : 'Subscribe'}
      </Button>

      {footer}
    </FlexRow>
  );
};

const FeedSubscriptionIntervalSetting: React.FC<{
  readonly feedSubscription: IntervalFeedSubscription;
}> = ({feedSubscription}) => {
  // TODO: Make this configurable.
  return <div>Interval setting: {feedSubscription.intervalSeconds} seconds</div>;
};

const FeedSubscriptionSettingsPopoverContent: React.FC<{
  readonly feedSubscription: FeedSubscription;
}> = ({feedSubscription}) => {
  return (
    <PopoverContent className="w-auto" align="end" side="bottom">
      <FlexColumn gap={4} padding={4}>
        <FeedSubscriptionDeliveryScheduleSetting feedSubscription={feedSubscription} />
        <FeedSubscriptionUnsubscribeButton feedSubscription={feedSubscription} />
        {feedSubscription.feedType === FeedType.Interval ? (
          <FeedSubscriptionIntervalSetting feedSubscription={feedSubscription} />
        ) : null}
      </FlexColumn>
    </PopoverContent>
  );
};

export const FeedSubscriptionSettingsButton: React.FC<{
  readonly feedSubscription: FeedSubscription;
}> = ({feedSubscription}) => {
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

      <FeedSubscriptionSettingsPopoverContent feedSubscription={feedSubscription} />
    </Popover>
  );
};
