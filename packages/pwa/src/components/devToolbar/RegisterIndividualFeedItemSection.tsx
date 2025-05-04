import {useEffect} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Button} from '@src/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/components/atoms/Dialog';

const IndividualFeedItemDevToolbarSection: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline" className="w-full">
          View feed item as JSON
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feed item JSON</DialogTitle>
        </DialogHeader>
        <pre style={{overflow: 'auto', maxHeight: '60vh'}}>{JSON.stringify(feedItem, null, 2)}</pre>
      </DialogContent>
    </Dialog>
  );
};

export const RegisterIndividualFeedItemDevToolbarSection: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    return registerSection({
      sectionType: DevToolbarSectionType.IndividualFeedItemActions,
      title: 'Current feed item',
      renderSection: () => <IndividualFeedItemDevToolbarSection feedItem={feedItem} />,
      requiresAuth: false,
    });
  }, [registerSection, feedItem]);

  return null;
};
