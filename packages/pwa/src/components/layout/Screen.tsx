import styled from 'styled-components';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';

export const ScreenWrapper = styled(FlexColumn)`
  width: 100%;
  height: 100%;
`;

export const ScreenMainContentWrapper = styled(FlexRow).attrs({
  align: 'stretch',
  flex: 1,
})`
  overflow: hidden;
`;
