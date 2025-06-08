import {IconName} from '@shared/types/icons.types';

import {Button} from '@src/components/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@src/components/atoms/DropdownMenu';
import {FlexColumn} from '@src/components/atoms/Flex';
import {P} from '@src/components/atoms/Text';
import {TextIcon} from '@src/components/atoms/TextIcon';
import {StorySection} from '@src/components/stories/StorySection';

export const DropdownMenuStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic dropdown">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>

      <StorySection title="Dropdown with icons">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Menu with Icons</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <TextIcon name={IconName.Inbox} size={16} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TextIcon name={IconName.MarkUnread} size={16} />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TextIcon name={IconName.MarkDone} size={16} />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>

      <StorySection title="Dropdown with groups">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Grouped Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Group 1</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Group 1 Item 1</DropdownMenuItem>
                <DropdownMenuItem>Group 1 Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Group 2</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Group 2 Item 1</DropdownMenuItem>
                <DropdownMenuItem>Group 2 Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>

      <StorySection title="Dropdown with disabled items">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Menu with Disabled Items</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Enabled Item</DropdownMenuItem>
            <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
            <DropdownMenuItem>Another Enabled Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>

      <StorySection title="Dropdown with custom content">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Custom Content Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <FlexColumn gap={2} padding={2}>
                <P>Custom dropdown content</P>
                <Button>Custom Button</Button>
              </FlexColumn>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>
    </>
  );
};
