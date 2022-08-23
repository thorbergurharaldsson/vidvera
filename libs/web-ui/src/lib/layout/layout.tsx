import { AuthContextState } from '@vidvera/shared';
import { NavBar } from '@vidvera/web-ui';
import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

/* eslint-disable-next-line */
export interface LayoutProps {
  user: AuthContextState;
}

export function Layout({ user, children }: PropsWithChildren<LayoutProps>) {
  return (
    <div className="flex">
      <NavBar user={user} />
      <div className="min-h-screen w-2/3 md:w-3/4 lg:w-5/6">
        <main className="-mb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
