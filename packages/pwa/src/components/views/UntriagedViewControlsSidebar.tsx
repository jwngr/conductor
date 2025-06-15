import type React from 'react';

import {
  getViewGroupByFieldText,
  getViewSortByFieldText,
  GROUP_BY_CREATED_TIME_OPTION,
  SORT_BY_CREATED_TIME_DESC_OPTION,
} from '@shared/lib/views.shared';

import {IconName} from '@shared/types/icons.types';
import type {ViewGroupByOption, ViewSortByOption} from '@shared/types/views.types';
import {ViewGroupByField, ViewSortByField} from '@shared/types/views.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {H6} from '@src/components/atoms/Text';
import * as styles from '@src/components/views/UntriagedViewControlsSidebar.css';

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
      <H6>Group by</H6>
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
      <H6>Sort by</H6>
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
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
  readonly onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
  readonly onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
}> = ({sortBy, groupBy, onSortByChange, onGroupByChange}) => {
  return (
    <FlexColumn overflow="auto" gap={4} padding={2} className={styles.controlsSidebarWrapper}>
      <ControlsSidebarGroupBySection groupBy={groupBy} onGroupByChange={onGroupByChange} />
      <ControlsSidebarSortBySection sortBy={sortBy} onSortByChange={onSortByChange} />
    </FlexColumn>
  );
};
