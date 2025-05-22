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
import {Text} from '@src/components/atoms/Text';
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
              <span className="i-lucide-pencil" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="i-lucide-trash" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="i-lucide-share" />
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
                <Text>Custom dropdown content</Text>
                <Button>Custom Button</Button>
              </FlexColumn>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySection>
    </>
  );
};
