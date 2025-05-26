import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemImportStatus, type FeedItemImportState} from '@shared/types/feedItems.types';

import {Badge} from '@src/components/atoms/Badge';

type StateBadgeVariant = 'default' | 'destructive' | 'outline';

export const FeedItemImportStatusBadge: React.FC<{
  readonly importState: FeedItemImportState;
}> = ({importState}) => {
  let badgeText: string | null;
  let badgeVariant: StateBadgeVariant | null = null;

  switch (importState.status) {
    case FeedItemImportStatus.New:
      badgeText = 'Queued';
      badgeVariant = 'outline';
      break;
    case FeedItemImportStatus.Processing:
      badgeText = 'Processing';
      badgeVariant = 'outline';
      break;
    case FeedItemImportStatus.Completed:
      if (importState.shouldFetch) {
        badgeText = 'Queued';
        badgeVariant = 'outline';
      } else {
        // Completed items have enough content to render already and don't need a badge.
        badgeText = null;
        badgeVariant = null;
      }
      break;
    case FeedItemImportStatus.Failed:
      if (importState.shouldFetch) {
        badgeText = 'Queued';
        badgeVariant = 'outline';
      } else {
        badgeText = 'Import Failed';
        badgeVariant = 'destructive';
      }
      break;
    default:
      assertNever(importState);
  }

  if (!badgeText) {
    return null;
  }

  return <Badge variant={badgeVariant}>{badgeText}</Badge>;
};
