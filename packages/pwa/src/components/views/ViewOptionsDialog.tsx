import {toViewGroupByOptionText, toViewSortByOptionText} from '@shared/lib/views.shared';

import {IconName} from '@shared/types/icons.types';
import type {
  ViewGroupByField,
  ViewGroupByOption,
  ViewSortByField,
  ViewSortByOption,
} from '@shared/types/views.types';
import {SORT_BY_CREATED_TIME_DESC_OPTION} from '@shared/types/views.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {Popover, PopoverContent, PopoverTrigger} from '@src/components/atoms/Popover';

export const ViewOptionsDialog: React.FC<{
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
  onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
  onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
}> = ({sortBy, groupBy, onSortByChange, onGroupByChange}) => {
  const firstSortByOption = sortBy[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;
  const firstGroupByOption = groupBy.length === 0 ? null : groupBy[0].field;

  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onGroupByChange(
      event.target.value === 'none' ? [] : [{field: event.target.value as ViewGroupByField}]
    );
  };

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
    <Popover modal>
      <PopoverTrigger asChild>
        <ButtonIcon
          name={IconName.SlidersHorizontal}
          size={32}
          tooltip="Customize view"
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onClick={() => {}}
        />
      </PopoverTrigger>

      <PopoverContent className="w-auto" align="end" side="bottom">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="groupBy" className="text-sm font-medium">
              Group by
            </label>
            <select
              id="groupBy"
              value={firstGroupByOption ?? 'none'}
              onChange={handleGroupByChange}
              className="rounded border border-stone-300 p-1 text-sm"
            >
              <option value="none">None</option>
              <option value="type">{toViewGroupByOptionText('type')}</option>
              <option value="importState">{toViewGroupByOptionText('importState')}</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sortField" className="text-sm font-medium">
              Sort by
            </label>
            <div className="flex items-center gap-1">
              <select
                id="sortField"
                value={firstSortByOption.field}
                onChange={handleSortFieldChange}
                className="rounded border border-stone-300 p-1 text-sm"
              >
                <option value="createdTime">{toViewSortByOptionText('createdTime')}</option>
                <option value="lastUpdatedTime">{toViewSortByOptionText('lastUpdatedTime')}</option>
                <option value="title">{toViewSortByOptionText('title')}</option>
              </select>
              <ButtonIcon
                name={sortDirectionIcon}
                size={24}
                tooltip={sortDirectionTooltip}
                onClick={handleSortDirectionToggle}
                aria-label="Toggle sort direction"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
