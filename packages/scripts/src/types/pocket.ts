// TODO: Moved this file @shared/types/pocket.ts. This requires updating the /scripts package to
// support imports from @shared.

export interface PocketExportedItem {
  readonly href: string;
  readonly title: string;
  readonly timeAdded: number;
}
