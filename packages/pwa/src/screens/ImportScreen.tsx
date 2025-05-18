import type React from 'react';
import {useState} from 'react';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {POCKET_EXPORT_FEED_SOURCE} from '@shared/lib/feedSources.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {
  ExternalMigrationItemStatus,
  NOT_STARTED_EXTERNAL_MIGRATION_ITEM_STATE,
  PROCESSING_EXTERNAL_MIGRATION_ITEM_STATE,
} from '@shared/types/migration.types';
import type {ExternalMigrationItemState} from '@shared/types/migration.types';
import type {PocketImportItem} from '@shared/types/pocket.types';
import type {Task} from '@shared/types/utils.types';

import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {parsePocketCsvContent} from '@sharedClient/lib/pocket.client';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {Button} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {ExternalLink} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {FeedItemImportStatusBadge} from '@src/components/feedItems/FeedItemImportStatusBadge';

import {Screen} from '@src/screens/Screen';

interface ImportScreenState {
  // List of items to import pulled from the CSV file.
  readonly pocketImportItems: readonly PocketImportItem[] | null;
  // Feed item import state associated with each Pocket import item. `null` means the item has not
  // even started importing yet.
  readonly importStates: Record<string, ExternalMigrationItemState>;
  // Error from parsing the CSV file.
  readonly fileError: Error | null;
}

const INITIAL_IMPORT_SCREEN_STATE: ImportScreenState = {
  pocketImportItems: null,
  fileError: null,
  importStates: {},
};

export const ImportScreen: React.FC = () => {
  const [state, setState] = useState<ImportScreenState>(INITIAL_IMPORT_SCREEN_STATE);
  const feedItemsService = useFeedItemsService();

  const setFileError = (error: Error): void => {
    setState((prev) => ({...prev, fileError: error}));
  };

  const setImportStatus = (key: string, status: ExternalMigrationItemState): void => {
    setState((prev) => ({
      ...prev,
      importStates: {...prev.importStates, [key]: status},
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    // Reset state every time user uploads a new file.
    setState(INITIAL_IMPORT_SCREEN_STATE);

    const file = event.target.files?.[0];
    if (!file) {
      setFileError(new Error('No file selected'));
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setFileError(new Error('Only CSV files are supported'));
      return;
    }

    const readPocketCsvResult = await asyncTry(async () => file.text());

    if (!readPocketCsvResult.success) {
      setFileError(prefixError(readPocketCsvResult.error, 'Error reading file'));
      return;
    }

    const parsePocketCsvResult = parsePocketCsvContent(readPocketCsvResult.value);

    if (!parsePocketCsvResult.success) {
      setFileError(prefixError(parsePocketCsvResult.error, 'Error parsing CSV'));
      return;
    }

    const pocketImportItems = parsePocketCsvResult.value;
    const importStates: Record<string, ExternalMigrationItemState> = {};
    pocketImportItems.forEach((item, index) => {
      importStates[`${item.url}-${index}`] = NOT_STARTED_EXTERNAL_MIGRATION_ITEM_STATE;
    });
    setState((prev) => ({...prev, importStates, pocketImportItems}));
  };

  const handleImportItem = async (item: PocketImportItem, key: string): Promise<void> => {
    setImportStatus(key, PROCESSING_EXTERNAL_MIGRATION_ITEM_STATE);

    const createResult = await feedItemsService.createFeedItem({
      feedSource: POCKET_EXPORT_FEED_SOURCE,
      url: item.url,
      title: item.title,
    });

    if (!createResult.success) {
      setImportStatus(key, {
        status: ExternalMigrationItemStatus.Failed,
        error: createResult.error,
      });
      return;
    }

    const feedItem = createResult.value;

    setImportStatus(key, {
      status: ExternalMigrationItemStatus.FeedItemExists,
      feedItem,
    });
  };

  const renderParsedItems = (): React.ReactNode => {
    if (state.pocketImportItems === null) return null;

    if (state.pocketImportItems.length === 0) {
      return <Text>No items found in the CSV file</Text>;
    }

    return (
      <FlexColumn gap={4}>
        <Text bold>
          Found {pluralizeWithCount(state.pocketImportItems.length, 'item')} to import:
        </Text>
        <FlexColumn gap={3}>
          {state.pocketImportItems.map((item, index) => {
            const key = `${item.url}-${index}`;
            const importStatus = state.importStates[key];

            return (
              <IndividualImportItem
                key={key}
                item={item}
                status={importStatus}
                onImport={() => void handleImportItem(item, key)}
              >
                {importStatus.status === ExternalMigrationItemStatus.FeedItemExists ? (
                  <FeedItemImportStatusBadge importState={importStatus.feedItem.importState} />
                ) : null}
              </IndividualImportItem>
            );
          })}
        </FlexColumn>
      </FlexColumn>
    );
  };

  return (
    <Screen withHeader withLeftSidebar>
      <FlexColumn flex={1} gap={6} padding={5} overflow="auto">
        <Text as="h2" bold>
          Import
        </Text>

        <FlexColumn gap={2}>
          <Text as="h2">Pocket</Text>
          <Text as="p" light>
            Download CSV file from{' '}
            <ExternalLink href="https://getpocket.com/export">Pocket</ExternalLink>
          </Text>
          <Input
            id="pocket-csv-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="max-w-sm"
          />
          {state.fileError ? (
            <Text as="p" className="text-error">
              {state.fileError.message}
            </Text>
          ) : null}
        </FlexColumn>

        {renderParsedItems()}
      </FlexColumn>
    </Screen>
  );
};

interface IndividualImportItemProps {
  readonly item: PocketImportItem;
  readonly status: ExternalMigrationItemState;
  readonly onImport: Task;
}

const IndividualImportItem: React.FC<WithChildren<IndividualImportItemProps>> = ({
  item,
  status,
  onImport,
  children,
}) => {
  const isImporting = status.status === ExternalMigrationItemStatus.CreatingFeedItem;
  const isImported = status.status === ExternalMigrationItemStatus.FeedItemExists;
  const isError = status.status === ExternalMigrationItemStatus.Failed;

  // Button text based on local status
  let buttonText = 'Import';
  if (isImporting) buttonText = 'Importing...';
  if (isImported) buttonText = 'Imported';
  if (isError) buttonText = 'Retry';

  return (
    <FlexRow gap={3} padding={3} className="rounded-lg border border-gray-200">
      <FlexColumn flex={1} gap={1}>
        <FlexRow gap={2}>
          <Text bold>{item.title}</Text>
          {children}
        </FlexRow>
        <Text as="p" light>
          {item.url}
        </Text>
        {isError ? (
          <Text as="p" className="text-error">
            {status.error.message}
          </Text>
        ) : null}
      </FlexColumn>
      <Button onClick={onImport} disabled={isImporting || isImported} size="sm">
        {buttonText}
      </Button>
    </FlexRow>
  );
};
