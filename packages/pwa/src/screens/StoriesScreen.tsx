import {Link} from '@tanstack/react-router';
import type React from 'react';
import {useMemo} from 'react';

import {PARSING_FAILURE_SENTINEL} from '@shared/lib/parser.shared';
import {
  findStoriesSidebarItemById,
  getAtomicComponentSidebarItems,
  getDesignSystemSidebarItems,
  getMoleculeComponentSidebarItems,
  getRendererSidebarItems,
} from '@shared/lib/stories.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {RendererType} from '@shared/types/renderers.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  MoleculeComponentType,
  StoriesSidebarSectionId,
} from '@shared/types/stories.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';

import {BadgeStories} from '@src/components/atoms/Badge.stories';
import {ButtonStories} from '@src/components/atoms/Button.stories';
import {ButtonIconStories} from '@src/components/atoms/ButtonIcon.stories';
import {CheckboxStories} from '@src/components/atoms/Checkbox.stories';
import {CustomIconStories} from '@src/components/atoms/CustomIcons.stories';
import {DialogStories} from '@src/components/atoms/Dialog.stories';
import {DividerStories} from '@src/components/atoms/Divider.stories';
import {DotStories} from '@src/components/atoms/Dot.stories';
import {DropdownMenuStories} from '@src/components/atoms/DropdownMenu.stories';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {FlexStories} from '@src/components/atoms/Flex.stories';
import {IconStories} from '@src/components/atoms/Icon.stories';
import {InputStories} from '@src/components/atoms/Input.stories';
import {LinkStories} from '@src/components/atoms/Link.stories';
import {SpacerStories} from '@src/components/atoms/Spacer.stories';
import {H1, H6, P} from '@src/components/atoms/Text';
import {TextStories} from '@src/components/atoms/Text.stories';
import {TextIconStories} from '@src/components/atoms/TextIcon.stories';
import {ToastStories} from '@src/components/atoms/Toast.stories';
import {TooltipStories} from '@src/components/atoms/Tooltip.stories';
import {ErrorAreaStories} from '@src/components/errors/ErrorArea.stories';
import {HeroAreaStories} from '@src/components/hero/HeroArea.stories';
import {MarkdownStories} from '@src/components/Markdown.stories';
import {ColorsStories} from '@src/components/stories/Colors.stories';
import {ColorsVanillaStories} from '@src/components/stories/ColorsVanilla.stories';
import {TypographyStories} from '@src/components/stories/Typography.stories';

import {DEFAULT_ROUTE, storiesRoute} from '@src/routes';
import {StoriesDefaultRedirect} from '@src/routes/Redirects';
import {DefaultErrorScreen} from '@src/screens/ErrorScreen';
import * as styles from '@src/screens/StoriesScreen.css';

const AtomicComponentStoryContent: React.FC<{
  readonly atomicComponentType: AtomicComponentType;
}> = ({atomicComponentType}) => {
  switch (atomicComponentType) {
    case AtomicComponentType.Badge:
      return <BadgeStories />;
    case AtomicComponentType.Button:
      return <ButtonStories />;
    case AtomicComponentType.ButtonIcon:
      return <ButtonIconStories />;
    case AtomicComponentType.Checkbox:
      return <CheckboxStories />;
    case AtomicComponentType.CustomIcon:
      return <CustomIconStories />;
    case AtomicComponentType.Dialog:
      return <DialogStories />;
    case AtomicComponentType.Divider:
      return <DividerStories />;
    case AtomicComponentType.Dot:
      return <DotStories />;
    case AtomicComponentType.DropdownMenu:
      return <DropdownMenuStories />;
    case AtomicComponentType.Flex:
      return <FlexStories />;
    case AtomicComponentType.Input:
      return <InputStories />;
    case AtomicComponentType.Link:
      return <LinkStories />;
    case AtomicComponentType.Spacer:
      return <SpacerStories />;
    case AtomicComponentType.Text:
      return <TextStories />;
    case AtomicComponentType.TextIcon:
      return <TextIconStories />;
    case AtomicComponentType.Toast:
      return <ToastStories />;
    case AtomicComponentType.Tooltip:
      return <TooltipStories />;
    default: {
      assertNever(atomicComponentType);
    }
  }
};

const DesignSystemStoryContent: React.FC<{
  readonly designSystemType: DesignSystemComponentType;
}> = ({designSystemType}) => {
  switch (designSystemType) {
    case DesignSystemComponentType.Colors:
      return <ColorsStories />;
    case DesignSystemComponentType.ColorsVanilla:
      return <ColorsVanillaStories />;
    case DesignSystemComponentType.Typography:
      return <TypographyStories />;
    case DesignSystemComponentType.Icons:
      return <IconStories />;
    default: {
      assertNever(designSystemType);
    }
  }
};

const RendererStoryContent: React.FC<{readonly rendererType: RendererType}> = ({rendererType}) => {
  switch (rendererType) {
    case RendererType.Markdown:
      return <MarkdownStories />;
    default: {
      assertNever(rendererType);
    }
  }
};

const MoleculeStoryContent: React.FC<{readonly moleculeType: MoleculeComponentType}> = ({
  moleculeType,
}) => {
  switch (moleculeType) {
    case MoleculeComponentType.HeroArea:
      return <HeroAreaStories />;
    case MoleculeComponentType.ErrorArea:
      return <ErrorAreaStories />;
    default: {
      assertNever(moleculeType);
    }
  }
};

const SidebarSection: React.FC<{
  readonly title: string;
  readonly items: StoriesSidebarItem[];
  readonly activeSidebarItem: StoriesSidebarItem;
}> = ({title, items, activeSidebarItem}) => {
  return (
    <FlexColumn gap={2}>
      <H6 light>{title}</H6>
      <FlexColumn>
        {items.map((item) => (
          <Link
            key={item.sidebarItemId}
            to={storiesRoute.to}
            params={{sidebarItemId: item.sidebarItemId}}
          >
            <P
              className={styles.storyGroupSidebarItem({
                isActive: activeSidebarItem.sidebarItemId === item.sidebarItemId,
              })}
            >
              {item.title}
            </P>
          </Link>
        ))}
      </FlexColumn>
    </FlexColumn>
  );
};

const StoriesLeftSidebar: React.FC<{
  readonly activeSidebarItem: StoriesSidebarItem;
}> = ({activeSidebarItem}) => {
  return (
    <FlexColumn overflow="auto" className={styles.storiesLeftSidebar}>
      <div className="pt-4 pl-4">
        <Link to={DEFAULT_ROUTE.to} search={{feedItemId: undefined}}>
          <P underline="hover" light>
            ← Back to app
          </P>
        </Link>
      </div>
      <FlexColumn flex gap={6} padding={4}>
        <SidebarSection
          title="Design system"
          items={getDesignSystemSidebarItems()}
          activeSidebarItem={activeSidebarItem}
        />
        <SidebarSection
          title="Atoms"
          items={getAtomicComponentSidebarItems()}
          activeSidebarItem={activeSidebarItem}
        />
        <SidebarSection
          title="Molecules"
          items={getMoleculeComponentSidebarItems()}
          activeSidebarItem={activeSidebarItem}
        />
        <SidebarSection
          title="Renderers"
          items={getRendererSidebarItems()}
          activeSidebarItem={activeSidebarItem}
        />
      </FlexColumn>
    </FlexColumn>
  );
};

const StoriesScreenMainContent: React.FC<{
  readonly activeSidebarItem: StoriesSidebarItem;
}> = ({activeSidebarItem}) => {
  let mainContent: React.ReactNode;
  switch (activeSidebarItem.sidebarSectionId) {
    case StoriesSidebarSectionId.DesignSystem:
      mainContent = <DesignSystemStoryContent designSystemType={activeSidebarItem.sidebarItemId} />;
      break;
    case StoriesSidebarSectionId.AtomicComponents:
      mainContent = (
        <AtomicComponentStoryContent atomicComponentType={activeSidebarItem.sidebarItemId} />
      );
      break;
    case StoriesSidebarSectionId.Renderers:
      mainContent = <RendererStoryContent rendererType={activeSidebarItem.sidebarItemId} />;
      break;
    case StoriesSidebarSectionId.Molecules:
      mainContent = <MoleculeStoryContent moleculeType={activeSidebarItem.sidebarItemId} />;
      break;
    default: {
      assertNever(activeSidebarItem);
    }
  }

  return (
    <FlexColumn
      flex
      gap={8}
      padding={4}
      overflow="auto"
      className={styles.storiesScreenMainContent}
    >
      <H1 bold>{activeSidebarItem.title}</H1>
      {mainContent}
    </FlexColumn>
  );
};

export const StoriesScreen: React.FC = () => {
  const {sidebarItemId} = storiesRoute.useParams();

  const sidebarItem: StoriesSidebarItem | null = useMemo(() => {
    if (!sidebarItemId || sidebarItemId === PARSING_FAILURE_SENTINEL) {
      return null;
    }
    return findStoriesSidebarItemById(sidebarItemId);
  }, [sidebarItemId]);

  if (!sidebarItemId) {
    // This root redirect is expected.
    return <StoriesDefaultRedirect />;
  }

  if (!sidebarItem) {
    return <DefaultErrorScreen error={new Error('Story ID in URL failed to parse')} />;
  }

  return (
    <FlexRow overflow="hidden" className={styles.storiesScreen}>
      <StoriesLeftSidebar activeSidebarItem={sidebarItem} />
      <StoriesScreenMainContent activeSidebarItem={sidebarItem} />
    </FlexRow>
  );
};
