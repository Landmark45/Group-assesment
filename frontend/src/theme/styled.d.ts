import 'styled-components';

import type { EduConnectTheme } from './educonnect.theme';

/**
 * Teaches styled-components what our theme looks like, so every
 * `${({ theme }) => theme.colors.primary}` is checked by the compiler and
 * autocompletes in the editor.
 */
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends EduConnectTheme {}
}
