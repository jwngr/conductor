import type React from 'react';
import {useState} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';
import {formatWithCommas, pluralizeWithCount} from '@shared/lib/utils.shared';

import type {PocketImportItem} from '@shared/types/pocket.types';
import type {Result} from '@shared/types/result.types';
import {makeErrorResult} from '@shared/types/result.types';

import {parsePocketCsvContent} from '@sharedClient/lib/pocket.client';

import {AppHeader} from '@src/components/AppHeader';
import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {ExternalLink} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {LeftSidebar} from '@src/components/LeftSidebar';

interface ImportStatus {
  status: 'idle' | 'importing' | 'imported' | 'error';
  errorMessage?: string;
}

export const ImportScreen: React.FC = () => {
  const [parseResult, setParseResult] = useState<Result<readonly PocketImportItem[]>>();
  const [fileError, setFileError] = useState<string>();
  const [importStatuses, setImportStatuses] = useState<Record<string, ImportStatus>>({});

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setParseResult(undefined);
    setFileError(undefined);
    setImportStatuses({});

    const file = event.target.files?.[0];
    if (!file) {
      setFileError('No file selected.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Please select a CSV file.');
      return;
    }

    const readFileResult = await asyncTry(async () => file.text());

    if (!readFileResult.success) {
      setFileError(`Error reading file: ${readFileResult.error.message}`);
      setParseResult(makeErrorResult(readFileResult.error));
      return;
    }

    const fileContent = readFileResult.value;
    const result = parsePocketCsvContent(fileContent);
    setParseResult(result);

    if (result.success) {
      const initialStatuses: Record<string, ImportStatus> = {};
      result.value.forEach((item, index) => {
        initialStatuses[`${item.url}-${index}`] = {status: 'idle'};
      });
      setImportStatuses(initialStatuses);
    }
  };

  const handleImportItem = async (item: PocketImportItem, key: string): Promise<void> => {
    setImportStatuses((prev) => ({...prev, [key]: {status: 'importing'}}));

    // TODO: Implement actual import logic using ClientFeedItemsService
    // 1. Call createFeedItem with item.url and source { type: 'pocket_import' }
    // 2. If successful, call updateFeedItem with the new feedItemId and item.title
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    // Simulate success/error for now
    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
      setImportStatuses((prev) => ({...prev, [key]: {status: 'imported'}}));
    } else {
      setImportStatuses((prev) => ({
        ...prev,
        [key]: {status: 'error', errorMessage: 'Failed to import item.'},
      }));
    }
  };

  const renderParsedItems = (): React.ReactNode => {
    if (!parseResult) return null;

    if (!parseResult.success) {
      return <Text className="text-error">Error parsing CSV: {parseResult.error.message}</Text>;
    }

    if (parseResult.value.length === 0) {
      return <Text>No items found in the CSV file.</Text>;
    }

    return (
      <div className="flex flex-col gap-4">
        <Text bold>
          Found {pluralizeWithCount(parseResult.value.length, 'item', 'items')} to import:
        </Text>
        <div className="flex flex-col gap-3">
          {parseResult.value.map((item, index) => {
            const key = `${item.url}-${index}`;
            const importStatus = importStatuses[key] ?? {status: 'idle'};
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
            {fileError && <Text className="text-error text-sm">{fileError}</Text>}
          </div>

          {renderParsedItems()}
        </div>
      </div>
    </div>
  );
};
