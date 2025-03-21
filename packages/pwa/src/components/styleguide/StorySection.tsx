import {Text} from '@src/components/atoms/Text';

export const StorySection: React.FC<{
  readonly title: string | null;
  readonly children: React.ReactNode;
}> = ({title, children}) => {
  return (
    <div className="flex flex-col gap-3">
      {title ? (
        <Text as="h2" bold>
          {title}
        </Text>
      ) : null}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
};
