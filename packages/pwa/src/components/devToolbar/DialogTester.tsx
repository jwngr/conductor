import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/components/atoms/Dialog';
import {Text} from '@src/components/atoms/Text';
import {Button} from '@src/components/devToolbar/Button';

export const DialogTester: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open test dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <Text as="p">This is a test description</Text>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
