import type React from 'react';

import {getFeedItemContentTypeText} from '@shared/lib/feedItems.shared';
import {
  getFeedSubscriptionIdForFeedSource,
  getNameForFeedSourceType,
} from '@shared/lib/feedSources.shared';
import {
  forEachObjectEntries,
  mapEntries,
  reduceArray,
  reduceObjectValues,
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

const ControlsSidebarCategorySection = <T extends string>(args: {
  readonly title: string;
  readonly feedItems: readonly FeedItem[];
  readonly activeCategories: Set<T>;
  readonly reducer: (acc: Record<T, number>, item: FeedItem) => Record<T, number>;
  readonly getCategoryName: (category: T) => string;
  readonly onCategoryClick: (category: T) => void;
}): React.ReactElement => {
  const {title, feedItems, activeCategories, reducer, getCategoryName, onCategoryClick} = args;

  const itemCountByCategory = {} as Record<T, number>;
  reduceArray(feedItems, reducer, itemCountByCategory);

  const totalItemCount = reduceObjectValues(
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
        {mapEntries(itemCountByCategory, (category, itemCount) => (
          <FlexRow key={category} justify="between" onClick={() => onCategoryClick(category)}>
            <P bold={activeCategories.has(category)}>{getCategoryName(category)}</P>
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
    <ControlsSidebarCategorySection<TagId>
      title="Tags"
      feedItems={feedItems}
      activeCategories={tagIdsToFilterBy}
      reducer={(acc, item) => {
        forEachObjectEntries(item.tagIds, (tagId) => {
          acc[tagId] = (acc[tagId] ?? 0) + 1;
        });
        return acc;
      }}
      getCategoryName={(tagId) => {
        // TODO: Get tag name from store.
        return tagId;
      }}
      onCategoryClick={onTagClick}
    />
  );
};

const ControlsSidebarFeedSourcesSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly sourceTypesToFilterBy: Set<FeedSourceType>;
  readonly onFeedSourceClick: Consumer<FeedSourceType>;
}> = ({feedItems, sourceTypesToFilterBy, onFeedSourceClick}) => {
  return (
    <ControlsSidebarCategorySection<FeedSourceType>
      title="Sources"
      feedItems={feedItems}
      activeCategories={sourceTypesToFilterBy}
      reducer={(acc, item) => {
        acc[item.feedSource.feedSourceType] = (acc[item.feedSource.feedSourceType] ?? 0) + 1;
        return acc;
      }}
      getCategoryName={getNameForFeedSourceType}
      onCategoryClick={onFeedSourceClick}
    />
  );
};

const ControlsSidebarFeedSubscriptionsSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly subscriptionIdsToFilterBy: Set<UserFeedSubscriptionId>;
  readonly onFeedSubscriptionClick: Consumer<UserFeedSubscriptionId>;
}> = ({feedItems, subscriptionIdsToFilterBy, onFeedSubscriptionClick}) => {
  return (
    <ControlsSidebarCategorySection<UserFeedSubscriptionId>
      title="Subscriptions"
      feedItems={feedItems}
      activeCategories={subscriptionIdsToFilterBy}
      reducer={(acc, item) => {
        const feedSubscriptionId = getFeedSubscriptionIdForFeedSource(item.feedSource);
        if (feedSubscriptionId) {
          acc[feedSubscriptionId] = (acc[feedSubscriptionId] ?? 0) + 1;
        }
        return acc;
      }}
      getCategoryName={(feedSubscriptionId) => {
        // TODO: Get feed subscription name from store.
        return feedSubscriptionId;
      }}
      onCategoryClick={onFeedSubscriptionClick}
    />
  );
};

const ControlsSidebarContentTypesSection: React.FC<{
  readonly feedItems: readonly FeedItem[];
  readonly contentTypesToFilterBy: Set<FeedItemContentType>;
  readonly onContentTypeClick: Consumer<FeedItemContentType>;
}> = ({feedItems, contentTypesToFilterBy, onContentTypeClick}) => {
  return (
    <ControlsSidebarCategorySection<FeedItemContentType>
      title="Content types"
      feedItems={feedItems}
      activeCategories={contentTypesToFilterBy}
      reducer={(acc, item) => {
        acc[item.feedItemContentType] = (acc[item.feedItemContentType] ?? 0) + 1;
        return acc;
      }}
      getCategoryName={getFeedItemContentTypeText}
      onCategoryClick={onContentTypeClick}
    />
  );
};

const ControlsSidebarGroupBySection: React.FC<{
  readonly groupBy: readonly ViewGroupByOption[];
  readonly onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
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
    onGroupByChange([{field: event.target.value as ViewGroupByField}]);
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
  readonly onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
}> = ({sortBy, onSortByChange}) => {
  const sortByOptions = [
    ViewSortByField.CreatedTime,
    ViewSortByField.Title,
    ViewSortByField.LastUpdatedTime,
  ];

  const firstSortByOption = sortBy[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;

  const handleSortFieldChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onSortByChange([
      {
        field: event.target.value as ViewSortByField,
        direction: firstSortByOption.direction,
      },
    ]);
  };

  const handleSortDirectionToggle = (): void => {
    onSortByChange((prevOptions) => {
      const currentSortOption = prevOptions[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;
      const newDirection = currentSortOption.direction === 'asc' ? 'desc' : 'asc';
      return [
        {
          field: currentSortOption.field,
          direction: newDirection,
        },
      ];
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
        {/* TODO: Use `DropdownMenu` atomic component. */}
        <select
          value={firstSortByOption.field}
          onChange={handleSortFieldChange}
          // TODO: Migrate to vanilla-extract.
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
  readonly onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
  readonly onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
  readonly onSourceTypesToFilterByChange: React.Dispatch<React.SetStateAction<Set<FeedSourceType>>>;
  readonly onContentTypesToFilterByChange: React.Dispatch<
    React.SetStateAction<Set<FeedItemContentType>>
  >;
  readonly onTagIdsToFilterByChange: React.Dispatch<React.SetStateAction<Set<TagId>>>;
  readonly onSubscriptionIdsToFilterByChange: React.Dispatch<
    React.SetStateAction<Set<UserFeedSubscriptionId>>
  >;
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
  onSourceTypesToFilterByChange,
  onContentTypesToFilterByChange,
  onTagIdsToFilterByChange,
  onSubscriptionIdsToFilterByChange,
}) => {
  return (
    <FlexColumn overflow="auto" gap={4} padding={2} className={styles.controlsSidebarWrapper}>
      <ControlsSidebarTagsSection
        feedItems={feedItems}
        tagIdsToFilterBy={tagIdsToFilterBy}
        onTagClick={(tagId) => onTagIdsToFilterByChange((prev) => ({...prev, [tagId]: true}))}
      />
      <ControlsSidebarFeedSubscriptionsSection
        feedItems={feedItems}
        subscriptionIdsToFilterBy={subscriptionIdsToFilterBy}
        onFeedSubscriptionClick={(feedSubscriptionId) =>
          onSubscriptionIdsToFilterByChange((prev) => ({...prev, [feedSubscriptionId]: true}))
        }
      />
      <ControlsSidebarFeedSourcesSection
        feedItems={feedItems}
        sourceTypesToFilterBy={sourceTypesToFilterBy}
        onFeedSourceClick={(feedSourceType) =>
          onSourceTypesToFilterByChange((prev) => ({...prev, [feedSourceType]: true}))
        }
      />
      <ControlsSidebarContentTypesSection
        feedItems={feedItems}
        contentTypesToFilterBy={contentTypesToFilterBy}
        onContentTypeClick={(feedItemContentType) =>
          onContentTypesToFilterByChange((prev) => ({...prev, [feedItemContentType]: true}))
        }
      />
      <ControlsSidebarGroupBySection groupBy={groupBy} onGroupByChange={onGroupByChange} />
      <ControlsSidebarSortBySection sortBy={sortBy} onSortByChange={onSortByChange} />
    </FlexColumn>
  );
};
