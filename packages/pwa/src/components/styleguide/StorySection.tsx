import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

export const StorySection: React.FC<{
  readonly title: string;
  readonly children: React.ReactNode;
}> = ({title, children}) => {
  return (
    <FlexColumn gap={12}>
      <Text as="h2" bold>
        {title}
      </Text>
      <FlexColumn gap={20}>{children}</FlexColumn>
    </FlexColumn>
  );
};
