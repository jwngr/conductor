import type React from 'react';

export const ScreenWrapper: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  return <div className="flex h-full w-full flex-col">{children}</div>;
};

export const ScreenMainContentWrapper: React.FC<{readonly children: React.ReactNode}> = ({
  children,
}) => {
  return <div className="flex flex-1 items-stretch overflow-hidden">{children}</div>;
};
