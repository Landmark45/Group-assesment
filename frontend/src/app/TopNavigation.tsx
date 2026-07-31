import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../shared/components/Button';
import { useAuthentication } from '../domains/identity/hooks/AuthenticationContext';

const NavigationBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: ${({ theme }) => `${theme.colors.pageBackgroundElevated}f2`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const NavigationInner = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  height: ${({ theme }) => theme.layout.navigationHeight};
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `0 ${theme.spacing.lg}`};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    padding: ${({ theme }) => `0 ${theme.spacing.md}`};
  }
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const BrandMark = styled.span`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textOnPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const NavigationLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NavigationLink = styled(NavLink)`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    color: ${({ theme }) => theme.colors.textPrimary};
    text-decoration: none;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryOnSoft};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    display: none;
  }
`;

const AccountMenuWrapper = styled.div`
  position: relative;
`;

const AccountTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm} ${theme.spacing.xxs} ${theme.spacing.xxs}`};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  transition: border-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const AvatarBubble = styled.span<{ $imageUrl: string }>`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background-color: ${({ theme }) => theme.colors.primarySoft};
  background-image: ${({ $imageUrl }) => ($imageUrl !== '' ? `url(${$imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  color: ${({ theme }) => theme.colors.primaryOnSoft};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
`;

const AccountName = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    display: none;
  }
`;

const AccountMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 208px;
  padding: ${({ theme }) => theme.spacing.xxs};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
  z-index: 30;
`;

const AccountMenuItem = styled(Link)`
  display: block;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceMuted};
    text-decoration: none;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const AccountMenuButton = styled.button`
  display: block;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: none;
  text-align: left;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerSoft};
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  margin: ${({ theme }) => theme.spacing.xxs} 0;
  background-color: ${({ theme }) => theme.colors.border};
`;

const SignedOutActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

function buildInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter((namePart) => namePart !== '')
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');
}

export function TopNavigation(): JSX.Element {
  const { currentUser, isAuthenticated, endSession } = useAuthentication();
  const navigate = useNavigate();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  /**
   * Close the account menu on an outside click or Escape. Both listeners are
   * removed when the menu closes or the component unmounts — leaving a document
   * listener behind is the classic React memory leak.
   */
  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function handleDocumentPointerDown(pointerEvent: MouseEvent): void {
      if (
        accountMenuRef.current !== null &&
        !accountMenuRef.current.contains(pointerEvent.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleDocumentKeyDown(keyboardEvent: KeyboardEvent): void {
      if (keyboardEvent.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isAccountMenuOpen]);

  function handleSignOut(): void {
    setIsAccountMenuOpen(false);
    endSession();
    navigate('/courses');
  }

  return (
    <NavigationBar>
      <NavigationInner aria-label="Main">
        <BrandLink to="/">
          <BrandMark aria-hidden="true">✦</BrandMark>
          EduConnect
        </BrandLink>

        <NavigationLinks>
          <NavigationLink to="/courses">Catalog</NavigationLink>
          {isAuthenticated ? (
            <>
              <NavigationLink to="/dashboard">Dashboard</NavigationLink>
              <NavigationLink to="/my-courses">My Courses</NavigationLink>
              <NavigationLink to="/courses/new">Teach</NavigationLink>
            </>
          ) : null}

          {isAuthenticated && currentUser !== null ? (
            <AccountMenuWrapper ref={accountMenuRef}>
              <AccountTrigger
                type="button"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen((wasOpen) => !wasOpen)}
              >
                <AvatarBubble $imageUrl={currentUser.profilePictureUrl}>
                  {currentUser.profilePictureUrl === ''
                    ? buildInitials(currentUser.fullName)
                    : null}
                </AvatarBubble>
                <AccountName>{currentUser.fullName.split(' ')[0]}</AccountName>
                <span aria-hidden="true">▾</span>
              </AccountTrigger>

              {isAccountMenuOpen ? (
                <AccountMenu role="menu">
                  <AccountMenuItem
                    to="/dashboard"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Your dashboard
                  </AccountMenuItem>
                  <AccountMenuItem
                    to="/my-courses"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    My courses
                  </AccountMenuItem>
                  <AccountMenuItem
                    to="/courses/new"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Publish a course
                  </AccountMenuItem>
                  <AccountMenuItem
                    to="/profile"
                    role="menuitem"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Profile &amp; password
                  </AccountMenuItem>
                  <MenuDivider />
                  <AccountMenuButton type="button" role="menuitem" onClick={handleSignOut}>
                    Sign out
                  </AccountMenuButton>
                </AccountMenu>
              ) : null}
            </AccountMenuWrapper>
          ) : (
            <SignedOutActions>
              <Link to="/login">
                <Button type="button" as="span" $variant="ghost" $size="small">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button type="button" as="span" $size="small">
                  Join free
                </Button>
              </Link>
            </SignedOutActions>
          )}
        </NavigationLinks>
      </NavigationInner>
    </NavigationBar>
  );
}
