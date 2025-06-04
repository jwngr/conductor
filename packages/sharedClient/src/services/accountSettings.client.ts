import {logger} from '@shared/services/logger.shared';

import {ACCOUNT_SETTINGS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseAccountSettings} from '@shared/parsers/accountSettings.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {ThemePreference} from '@shared/types/theme.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import type {AccountSettingsFromStorage} from '@shared/schemas/accountSettings.schema';
import {toStorageAccountSettings} from '@shared/storage/accountSettings.storage';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

type ClientAccountSettingsCollectionService = ClientFirestoreCollectionService<
  AccountId,
  AccountSettings,
  AccountSettingsFromStorage
>;

export const clientAccountSettingsCollectionService = makeClientFirestoreCollectionService({
  collectionPath: ACCOUNT_SETTINGS_DB_COLLECTION,
  toStorage: toStorageAccountSettings,
  fromStorage: parseAccountSettings,
  parseId: parseAccountId,
});

export class ClientAccountSettingsService {
  private readonly accountId: AccountId;
  private readonly accountSettingsCollectionService: ClientAccountSettingsCollectionService;
  private readonly eventLogService: ClientEventLogService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly accountSettingsCollectionService: ClientAccountSettingsCollectionService;
    readonly eventLogService: ClientEventLogService;
  }) {
    this.accountId = args.accountId;
    this.accountSettingsCollectionService = args.accountSettingsCollectionService;
    this.eventLogService = args.eventLogService;
  }

  public watchAccountSettings(
    onData: Consumer<AccountSettings>,
    onError: Consumer<Error>
  ): Unsubscribe {
    const handleOnData: Consumer<AccountSettings | null> = (accountSettings) => {
      if (!accountSettings) {
        onError(new Error('No account settings found'));
        return;
      }
      onData(accountSettings);
    };

    const handleOnError: Consumer<Error> = (error) => {
      const betterError = new Error('Failed to fetch account settings');
      logger.error(prefixError(error, betterError.message));
      onError(betterError);
    };

    return this.accountSettingsCollectionService.watchDoc(
      this.accountId,
      handleOnData,
      handleOnError
    );
  }

  public async updateThemePreference(themePreference: ThemePreference): AsyncResult<void> {
    const result = await this.accountSettingsCollectionService.updateDoc(this.accountId, {
      themePreference,
    });
    if (result.success) {
      // Don't wait for the event to be logged.
      void this.eventLogService.logThemePreferenceChangedEvent({themePreference});
    }
    return result;
  }
}
