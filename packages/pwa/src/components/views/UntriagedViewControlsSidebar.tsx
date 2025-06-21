import type React from 'react';

import {arrayReduce} from '@shared/lib/arrayUtils.shared';
import {getFeedItemContentTypeText} from '@shared/lib/feedItemContent.shared';
import {getFeedSubscriptionIdForItem} from '@shared/lib/feedItems.shared';
import {getNameForFeedType} from '@shared/lib/feeds.shared';
import {
  objectForEachEntry,
  objectMapEntries,
  objectReduceValues,
} from '@shared/lib/objectUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {
  getViewGroupByFieldText,
  getViewSortByFieldText,
  GROUP_BY_CREATED_TIME_OPTION,
  SORT_BY_CREATED_TIME_DESC_OPTION,
} from '@shared/lib/views.shared';

import type {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {FeedItem} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import {IconName} from '@shared/types/icons.types';
import type {TagId} from '@shared/types/tags.types';
import type {Consumer} from '@shared/types/utils.types';
import type {ViewGroupByOption, ViewSortByOption} from '@shared/types/views.types';
import {ViewGroupByField, ViewSortByField} from '@shared/types/views.types';

import {useFeedSubscriptionsStore} from '@sharedClient/stores/FeedSubscriptionsStore';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {H6, P} from '@src/components/atoms/Text';
import * as styles from '@src/components/views/UntriagedViewControlsSidebar.css';

const ControlsSidebarFilterCriteriaSection = <T extends string>(args: {
  readonly title: string;
  readonly feedItems: readonly FeedItem[];
  readonly activeCriteria: Set<T>;
  readonly reducer: (acc: Record<T, number>, item: FeedItem) => Record<T, number>;
  readonly getCriteriaName: (criteria: T) => string;
  readonly onCriteriaClick: (criteria: T) => void;
}): React.ReactElement => {
  const {title, feedItems, activeCriteria, reducer, getCriteriaName, onCriteriaClick} = args;

  const itemCountByCategory = {} as Record<T, number>;
  arrayReduce(feedItems, reducer, itemCountByCategory);

  const totalItemCount = objectReduceValues(
    itemCountByCategory,
    (acc, itemCount) => acc + itemCount,
    0
  );

  let mainContent: React.ReactNode;
  if (totalItemCount === 0) {
    mainContent = <P>None</P>;
  } else {
    mainContent = (
      <FlexColumn gap={2}>
        {objectMapEntries(itemCountByCategory, (category, itemCount) => (
          <FlexRow key={category} justify="between" onClick={() => onCriteriaClick(category)}>
            <P bold={activeCriteria.has(category)}>{getCriteriaName(category)}</P>
            <H6 light>{itemCount}</H6>
          </FlexRow>
        ))}
      </FlexColumn>
    );
  }

  return (
    <FlexColumn gap={1}>
      <H6 bold light>
        {title}
      </H6>
      <FlexColumn gap={2}>{mainContent}</FlexColumn>
    </FlexColumn>
  );
};

const ControlsSidebarTagsSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly tagIdsToFilterBy: Set<TagId>;
  readonly onTagClick: Consumer<TagId>;
}> = ({feedItems, tagIdsToFilterBy, onTagClick}) => {
  return (
    <ControlsSidebarFilterCriteriaSection<TagId>
      title="Tags"
      feedItems={feedItems}
      activeCriteria={tagIdsToFilterBy}
      reducer={(acc, item) => {
        objectForEachEntry(item.tagIds, (tagId) => {
          acc[tagId] = (acc[tagId] ?? 0) + 1;
        });
        return acc;
      }}
      getCriteriaName={(tagId) => {
        // TODO: Get tag name from store.
        return tagId;
      }}
      onCriteriaClick={onTagClick}
    />
  );
};

const ControlsSidebarFeedsSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly feedTypesToFilterBy: Set<FeedType>;
  readonly onFeedClick: Consumer<FeedType>;
}> = ({feedItems, feedTypesToFilterBy, onFeedClick}) => {
  return (
    <ControlsSidebarFilterCriteriaSection<FeedType>
      title="Sources"
      feedItems={feedItems}
      activeCriteria={feedTypesToFilterBy}
      reducer={(acc, item) => {
        acc[item.origin.feedType] = (acc[item.origin.feedType] ?? 0) + 1;
        return acc;
      }}
      getCriteriaName={getNameForFeedType}
      onCriteriaClick={onFeedClick}
    />
  );
};

const ControlsSidebarFeedSubscriptionsSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly subscriptionIdsToFilterBy: Set<FeedSubscriptionId>;
  readonly onFeedSubscriptionClick: Consumer<FeedSubscriptionId>;
}> = ({feedItems, subscriptionIdsToFilterBy, onFeedSubscriptionClick}) => {
  const {getFeedSubscription} = useFeedSubscriptionsStore();

  const getCriteriaName = (feedSubscriptionId: FeedSubscriptionId): string => {
    const feedSubscription = getFeedSubscription(feedSubscriptionId);
    if (!feedSubscription) return feedSubscriptionId;
    switch (feedSubscription.feedType) {
      case FeedType.RSS:
        return feedSubscription.title;
      case FeedType.YouTubeChannel:
        return feedSubscription.channelId;
      case FeedType.Interval:
        return `Interval (${feedSubscription.intervalSeconds}s)`;
      default:
        assertNever(feedSubscription);
    }
  };

  return (
    <ControlsSidebarFilterCriteriaSection<FeedSubscriptionId>
      title="Subscriptions"
      feedItems={feedItems}
      activeCriteria={subscriptionIdsToFilterBy}
      reducer={(acc, item) => {
        const feedSubscriptionId = getFeedSubscriptionIdForItem(item);
        if (feedSubscriptionId) {
          acc[feedSubscriptionId] = (acc[feedSubscriptionId] ?? 0) + 1;
        }
        return acc;
      }}
      getCriteriaName={getCriteriaName}
      onCriteriaClick={onFeedSubscriptionClick}
    />
  );
};

const ControlsSidebarContentTypesSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly contentTypesToFilterBy: Set<FeedItemContentType>;
  readonly onContentTypeClick: Consumer<FeedItemContentType>;
}> = ({feedItems, contentTypesToFilterBy, onContentTypeClick}) => {
  return (
    <ControlsSidebarFilterCriteriaSection<FeedItemContentType>
      title="Content types"
      feedItems={feedItems}
      activeCriteria={contentTypesToFilterBy}
      reducer={(acc, item) => {
        acc[item.feedItemContentType] = (acc[item.feedItemContentType] ?? 0) + 1;
        return acc;
      }}
      getCriteriaName={getFeedItemContentTypeText}
      onCriteriaClick={onContentTypeClick}
    />
  );
};

const ControlsSidebarGroupBySection: React.FC<{
  readonly groupBy: readonly ViewGroupByOption[];
  readonly onGroupByChange: Consumer<ViewGroupByField>;
}> = ({groupBy, onGroupByChange}) => {
  const groupByFields = [
    ViewGroupByField.CreatedTime,
    ViewGroupByField.LastUpdatedTime,
    ViewGroupByField.FeedType,
    ViewGroupByField.FeedItemContentType,
    ViewGroupByField.TriageStatus,
    ViewGroupByField.ImportState,
  ];

  const firstGroupByOption: ViewGroupByOption | null = groupBy[0] ?? null;

  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onGroupByChange(event.target.value as ViewGroupByField);
  };

  return (
    <FlexColumn gap={1}>
      <H6 bold light>
        Group by
      </H6>
      <select
        id="groupBy"
        value={firstGroupByOption?.field ?? GROUP_BY_CREATED_TIME_OPTION.field}
        onChange={handleGroupByChange}
        className="rounded border border-stone-300 p-1 text-sm"
      >
        {groupByFields.map((groupByField) => (
          <option key={groupByField} value={groupByField}>
            {getViewGroupByFieldText(groupByField)}
          </option>
        ))}
      </select>
    </FlexColumn>
  );
};

const ControlsSidebarSortBySection: React.FC<{
  readonly sortBy: readonly ViewSortByOption[];
  readonly onSortByChange: Consumer<ViewSortByOption>;
}> = ({sortBy, onSortByChange}) => {
  const sortByOptions = [
    ViewSortByField.CreatedTime,
    ViewSortByField.Title,
    ViewSortByField.LastUpdatedTime,
  ];

  const firstSortByOption = sortBy[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;

  const handleSortFieldChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onSortByChange({
      field: event.target.value as ViewSortByField,
      direction: firstSortByOption.direction,
    });
  };

  const handleSortDirectionToggle = (): void => {
    const newDirection = firstSortByOption.direction === 'asc' ? 'desc' : 'asc';
    onSortByChange({
      field: firstSortByOption.field,
      direction: newDirection,
    });
  };

  const sortDirectionIcon =
    firstSortByOption.direction === 'asc' ? IconName.ArrowUp : IconName.ArrowDown;
  const sortDirectionTooltip =
    firstSortByOption.direction === 'asc' ? 'Sort Ascending' : 'Sort Descending';

  return (
    <FlexColumn gap={1}>
      <H6 bold light>
        Sort by
      </H6>
      <FlexRow gap={2}>
        <select
          value={firstSortByOption.field}
          onChange={handleSortFieldChange}
          className="border-neutral-2 rounded border p-1 text-sm"
        >
          {sortByOptions.map((field) => (
            <option key={field} value={field}>
              {getViewSortByFieldText(field)}
            </option>
          ))}
        </select>
        <ButtonIcon
          name={sortDirectionIcon}
          size={24}
          tooltip={sortDirectionTooltip}
          onClick={handleSortDirectionToggle}
          aria-label="Toggle sort direction"
        />
      </FlexRow>
    </FlexColumn>
  );
};

export const UntriagedViewControlsSidebar: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
  readonly feedTypesToFilterBy: Set<FeedType>;
  readonly contentTypesToFilterBy: Set<FeedItemContentType>;
  readonly tagIdsToFilterBy: Set<TagId>;
  readonly subscriptionIdsToFilterBy: Set<FeedSubscriptionId>;
  readonly onSortByChange: Consumer<ViewSortByOption>;
  readonly onGroupByChange: Consumer<ViewGroupByField>;
  readonly onSourceTypeClick: Consumer<FeedType>;
  readonly onContentTypeClick: Consumer<FeedItemContentType>;
  readonly onTagClick: Consumer<TagId>;
  readonly onSubscriptionClick: Consumer<FeedSubscriptionId>;
}> = ({
  feedItems,
  sortBy,
  groupBy,
  feedTypesToFilterBy,
  contentTypesToFilterBy,
  tagIdsToFilterBy,
  subscriptionIdsToFilterBy,
  onSortByChange,
  onGroupByChange,
  onSourceTypeClick,
  onContentTypeClick,
  onTagClick,
  onSubscriptionClick,
}) => {
  return (
    <FlexColumn overflow="auto" gap={4} padding={2} className={styles.controlsSidebarWrapper}>
      <ControlsSidebarTagsSection
        feedItems={feedItems}
        tagIdsToFilterBy={tagIdsToFilterBy}
        onTagClick={onTagClick}
      />
      <ControlsSidebarFeedSubscriptionsSection
        feedItems={feedItems}
        subscriptionIdsToFilterBy={subscriptionIdsToFilterBy}
        onFeedSubscriptionClick={onSubscriptionClick}
      />
      <ControlsSidebarFeedsSection
        feedItems={feedItems}
        feedTypesToFilterBy={feedTypesToFilterBy}
        onFeedClick={onSourceTypeClick}
      />
      <ControlsSidebarContentTypesSection
        feedItems={feedItems}
        contentTypesToFilterBy={contentTypesToFilterBy}
        onContentTypeClick={onContentTypeClick}
      />
      <ControlsSidebarGroupBySection groupBy={groupBy} onGroupByChange={onGroupByChange} />
      <ControlsSidebarSortBySection sortBy={sortBy} onSortByChange={onSortByChange} />
    </FlexColumn>
  );
};
