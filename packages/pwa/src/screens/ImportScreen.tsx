import type React from 'react';
import {useState} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import type {PocketImportItem} from '@shared/types/pocket.types';
import type {Result} from '@shared/types/result.types';

import {parsePocketCsvContent} from '@sharedClient/lib/pocket.client';

import {AppHeader} from '@src/components/AppHeader';
import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {ExternalLink} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {LeftSidebar} from '@src/components/LeftSidebar';

interface ImportStatus {
  readonly status: 'idle' | 'importing' | 'imported' | 'error';
  readonly errorMessage?: string;
}

interface ImportScreenState {
  readonly parseResult: Result<readonly PocketImportItem[]> | undefined;
  readonly fileError: string | undefined;
  readonly importStatuses: Record<string, ImportStatus>;
}

const INITIAL_IMPORT_SCREEN_STATE: ImportScreenState = {
  parseResult: undefined,
  fileError: undefined,
  importStatuses: {},
};

export const ImportScreen: React.FC = () => {
  const [state, setState] = useState<ImportScreenState>(INITIAL_IMPORT_SCREEN_STATE);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setState((prev) => ({
      ...prev,
      parseResult: undefined,
      fileError: undefined,
      importStatuses: {},
    }));

    const file = event.target.files?.[0];
    if (!file) {
      setState((prev) => ({...prev, fileError: 'No file selected.'}));
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setState((prev) => ({...prev, fileError: 'Please select a CSV file.'}));
      return;
    }

    const readFileResult = await asyncTry(async () => file.text());

    if (!readFileResult.success) {
      setState((prev) => ({
        ...prev,
        fileError: `Error reading file: ${readFileResult.error.message}`,
      }));
      return;
    }

    const fileContent = readFileResult.value;
    const result = parsePocketCsvContent(fileContent);
    setState((prev) => ({...prev, parseResult: result}));

    if (result.success) {
      const initialStatuses: Record<string, ImportStatus> = {};
      result.value.forEach((item, index) => {
        initialStatuses[`${item.url}-${index}`] = {status: 'idle'};
      });
      setState((prev) => ({...prev, importStatuses: initialStatuses}));
    }
  };

  const handleImportItem = async (item: PocketImportItem, key: string): Promise<void> => {
    setState((prev) => ({
      ...prev,
      importStatuses: {...prev.importStatuses, [key]: {status: 'importing'}},
    }));

    // TODO: Implement actual import logic using ClientFeedItemsService
    // 1. Call createFeedItem with item.url and source { type: 'pocket_import' }
    // 2. If successful, call updateFeedItem with the new feedItemId and item.title
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    // Simulate success/error for now
    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
      setState((prev) => ({
        ...prev,
        importStatuses: {...prev.importStatuses, [key]: {status: 'imported'}},
      }));
    } else {
      setState((prev) => ({
        ...prev,
        importStatuses: {
          ...prev.importStatuses,
          [key]: {status: 'error', errorMessage: 'Failed to import item.'},
        },
      }));
    }
  };

  const renderParsedItems = (): React.ReactNode => {
    if (!state.parseResult) return null;

    if (!state.parseResult.success) {
      return (
        <Text className="text-error">Error parsing CSV: {state.parseResult.error.message}</Text>
      );
    }

    if (state.parseResult.value.length === 0) {
      return <Text>No items found in the CSV file.</Text>;
    }

    return (
      <div className="flex flex-col gap-4">
        <Text bold>
          Found {pluralizeWithCount(state.parseResult.value.length, 'item', 'items')} to import:
        </Text>
        <div className="flex flex-col gap-3">
          {state.parseResult.value.map((item, index) => {
            const key = `${item.url}-${index}`;
            const importStatus = state.importStatuses[key] ?? {status: 'idle'};
            const isIdle = importStatus.status === 'idle';
            const isImporting = importStatus.status === 'importing';
            const isImported = importStatus.status === 'imported';
            const isError = importStatus.status === 'error';

            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <Text bold>{item.title || '(No Title)'}</Text>
                  <Text className="text-sm text-gray-500">{item.url}</Text>
                  {isError && (
                    <Text className="text-error text-sm">{importStatus.errorMessage}</Text>
                  )}
                </div>
                <Button
                  onClick={() => void handleImportItem(item, key)}
                  disabled={!isIdle}
                  size="sm"
                >
                  {isImporting && 'Importing...'}
                  {isImported && 'Imported'}
                  {isIdle && 'Import'}
                  {isError && 'Retry'} {/* Button text changes to Retry on error */}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-5">
          <Text as="h2" bold>
            Import
          </Text>

          <div className="flex flex-col gap-2">
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
            {state.fileError && <Text className="text-error text-sm">{state.fileError}</Text>}
          </div>

          {renderParsedItems()}
        </div>
      </div>
    </div>
  );
};
