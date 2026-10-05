import type { ReactNode } from "react";

/**
 * Factory for the `@tanstack/react-router` surface used by Layout/AppNav.
 *
 * This module deliberately imports nothing at runtime (only a type) so the
 * returned factory can be created inside `vi.hoisted` and referenced from a
 * hoisted `vi.mock` factory without hitting the temporal dead zone of an
 * imported binding. `Link` renders its children directly, which is enough for
 * the navigation assertions in the page tests.
 */
export interface RouterMock {
  useRouterState: (opts?: {
    select?: (state: { location: { pathname: string } }) => unknown;
  }) => unknown;
  useRouter: () => { navigate: () => void };
  useNavigate: () => () => void;
  Link: (props: { children?: ReactNode }) => ReactNode;
}

export function buatRouterMock(pathname = "/"): RouterMock {
  return {
    useRouterState: (opts) => {
      const state = { location: { pathname } };
      return opts?.select ? opts.select(state) : state;
    },
    useRouter: () => ({ navigate: () => {} }),
    useNavigate: () => () => {},
    Link: ({ children }) => children ?? null,
  };
}
