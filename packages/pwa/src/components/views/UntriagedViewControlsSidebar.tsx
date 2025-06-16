import type React from 'react';

import {getFeedItemContentTypeText} from '@shared/lib/feedItems.shared';
import {
  getFeedSubscriptionIdForFeedSource,
  getNameForFeedSourceType,
} from '@shared/lib/feedSources.shared';
import {
  arrayReduce,
  objectForEachEntry,
  objectMapEntries,
  objectReduceValues,
} from '@shared/lib/utils.shared';
import {
  getViewGroupByFieldText,
  getViewSortByFieldText,
  GROUP_BY_CREATED_TIME_OPTION,
  SORT_BY_CREATED_TIME_DESC_OPTION,
} from '@shared/lib/views.shared';

import type {FeedItem, FeedItemContentType} from '@shared/types/feedItems.types';
import type {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import {IconName} from '@shared/types/icons.types';
import type {TagId} from '@shared/types/tags.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer} from '@shared/types/utils.types';
import type {ViewGroupByOption, ViewSortByOption} from '@shared/types/views.types';
import {ViewGroupByField, ViewSortByField} from '@shared/types/views.types';

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

const ControlsSidebarFeedSourcesSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly sourceTypesToFilterBy: Set<FeedSourceType>;
  readonly onFeedSourceClick: Consumer<FeedSourceType>;
}> = ({feedItems, sourceTypesToFilterBy, onFeedSourceClick}) => {
  return (
    <ControlsSidebarFilterCriteriaSection<FeedSourceType>
      title="Sources"
      feedItems={feedItems}
      activeCriteria={sourceTypesToFilterBy}
      reducer={(acc, item) => {
        acc[item.feedSource.feedSourceType] = (acc[item.feedSource.feedSourceType] ?? 0) + 1;
        return acc;
      }}
      getCriteriaName={getNameForFeedSourceType}
      onCriteriaClick={onFeedSourceClick}
    />
  );
};

const ControlsSidebarFeedSubscriptionsSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly subscriptionIdsToFilterBy: Set<UserFeedSubscriptionId>;
  readonly onFeedSubscriptionClick: Consumer<UserFeedSubscriptionId>;
}> = ({feedItems, subscriptionIdsToFilterBy, onFeedSubscriptionClick}) => {
  return (
    <ControlsSidebarFilterCriteriaSection<UserFeedSubscriptionId>
      title="Subscriptions"
      feedItems={feedItems}
      activeCriteria={subscriptionIdsToFilterBy}
      reducer={(acc, item) => {
        const feedSubscriptionId = getFeedSubscriptionIdForFeedSource(item.feedSource);
        if (feedSubscriptionId) {
          acc[feedSubscriptionId] = (acc[feedSubscriptionId] ?? 0) + 1;
        }
        return acc;
      }}
      getCriteriaName={(feedSubscriptionId) => {
        // TODO: Get feed subscription name from store.
        return feedSubscriptionId;
      }}
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
    ViewGroupByField.FeedSourceType,
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
  readonly sourceTypesToFilterBy: Set<FeedSourceType>;
  readonly contentTypesToFilterBy: Set<FeedItemContentType>;
  readonly tagIdsToFilterBy: Set<TagId>;
  readonly subscriptionIdsToFilterBy: Set<UserFeedSubscriptionId>;
  readonly onSortByChange: Consumer<ViewSortByOption>;
  readonly onGroupByChange: Consumer<ViewGroupByField>;
  readonly onSourceTypeClick: Consumer<FeedSourceType>;
  readonly onContentTypeClick: Consumer<FeedItemContentType>;
  readonly onTagClick: Consumer<TagId>;
  readonly onSubscriptionClick: Consumer<UserFeedSubscriptionId>;
}> = ({
  feedItems,
  sortBy,
  groupBy,
  sourceTypesToFilterBy,
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
      <ControlsSidebarFeedSourcesSection
        feedItems={feedItems}
        sourceTypesToFilterBy={sourceTypesToFilterBy}
        onFeedSourceClick={onSourceTypeClick}
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
