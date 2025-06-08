import {FlexColumn} from '@src/components/atoms/Flex';
import {H2} from '@src/components/atoms/Text';

export const StorySection: React.FC<{
  readonly title: string | null;
  readonly children: React.ReactNode;
}> = ({title, children}) => {
  return (
    <FlexColumn gap={2}>
      {title ? <H2 bold>{title}</H2> : null}
      <FlexColumn gap={4}>{children}</FlexColumn>
    </FlexColumn>
  );
};
