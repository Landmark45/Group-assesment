import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { TopNavigation } from './TopNavigation';

const ShellGrid = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ShellBody = styled.div`
  flex: 1;
`;

const SiteFooter = styled.footer`
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.pageBackgroundElevated};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FooterNote = styled.p`
  max-width: 52ch;
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

export function AppShell(): JSX.Element {
  return (
    <ShellGrid>
      <TopNavigation />
      <ShellBody>
        <Outlet />
      </ShellBody>
      <SiteFooter>
        <FooterInner>
          <FooterNote>
            EduConnect — a small, warm place to teach what you know and learn what you want.
          </FooterNote>
          <span>Built as a demonstration project.</span>
        </FooterInner>
      </SiteFooter>
    </ShellGrid>
  );
}
