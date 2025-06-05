import {logger} from '@shared/services/logger.shared';

import {DEFAULT_FEED_TITLE} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {EXTENSION_FEED_SOURCE} from '@shared/lib/feedSources.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import {initServices} from '@src/lib/initServices.ext';

chrome.action.onClicked.addListener(async (tab) => {
  // TODO: Get the account ID from the extension's auth once it's implemented.
  const accountIdResult = parseAccountId('TODO');
  if (!accountIdResult.success) {
    logger.error(prefixError(accountIdResult.error, 'Error getting account ID'));
    return;
  }
  const accountId = accountIdResult.value;

  const tabUrl = tab.url;
  if (!tabUrl) {
    logger.error(new Error('No URL found for tab'));
    return;
  }

  const {feedItemsService} = initServices({accountId});

  const addFeedItemResult = await feedItemsService.createFeedItemFromUrl({
    feedSource: EXTENSION_FEED_SOURCE,
    content: {
      url: tabUrl,
      // TODO: Set better initial values for these fields.
      title: DEFAULT_FEED_TITLE,
      description: null,
      outgoingLinks: [],
      summary: null,
    },
  });

  if (!addFeedItemResult.success) {
    logger.error(prefixError(addFeedItemResult.error, 'Error saving URL'));
    return;
  }

  logger.log('URL saved successfully!', {});
});
