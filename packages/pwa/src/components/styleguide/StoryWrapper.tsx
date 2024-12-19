import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

export const StoryWrapper: React.FC<{
  readonly title: string;
  readonly children: React.ReactNode;
}> = ({title, children}) => {
  return (
    <FlexColumn gap={32}>
      <Text as="h1" bold>
        {title}
      </Text>
      <FlexColumn gap={20}>{children}</FlexColumn>
    </FlexColumn>
  );
};
