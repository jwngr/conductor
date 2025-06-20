import type React from 'react';
import {useState} from 'react';

import {NavItems} from '@shared/lib/navItems.shared';

import type {NavItemId} from '@shared/types/urls.types';

import {Dot} from '@src/components/atoms/Dot';
import {FlexRow} from '@src/components/atoms/Flex';
import {H3, H6} from '@src/components/atoms/Text';
import {NavItemLink} from '@src/components/nav/NavItemLink';
import * as styles from '@src/components/TopBar.css';

export const NavItemWithCount: React.FC<{
  readonly navItemId: NavItemId;
  readonly newCount: number;
  readonly totalCount: number;
  readonly isSelected: boolean;
}> = ({navItemId, newCount, totalCount, isSelected}) => {
  const [hovered, setHovered] = useState(false);

  const navItem = NavItems.fromId(navItemId);

  const showDot = totalCount > 0 && !hovered;
  const showCount = totalCount > 0 && hovered;
  const hasUnread = newCount > 0;

  return (
    <NavItemLink navItemId={navItem.id}>
      <FlexRow
        gap={2}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={styles.navItemWithCountWrapper({selected: isSelected})}
      >
        <H3 bold={isSelected}>{navItem.title}</H3>
        {showDot ? (
          // TODO: Use theme colors.
          <Dot size={8} color={hasUnread ? '#dd7d0f' : '#797998'} />
        ) : null}
        {showCount ? <H6>{totalCount}</H6> : null}
      </FlexRow>
    </NavItemLink>
  );
};
