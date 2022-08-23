// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import 'react-toastify/dist/ReactToastify.css';

import { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout } from '@vidvera/web-ui';
import { AuthContext } from '../AuthContext';
import Vidvera from '../pages/Tenant/Users';
import Invite from '../pages/Admin/Invite';
import Error404 from '../pages/Error404';
import NewTenant from '../pages/Admin/NewTenant';
import { TenantPage } from '../pages/Tenant/TenantPage';
import { AcceptTenantInvitePage } from '../pages/Admin/AcceptTenantInvitePage';

export function App() {
  const user = useContext(AuthContext);

  return (
    <>
      <Routes>
        <Route element={<Layout user={user} />}>
          <Route path="/" element={<TenantPage />} />
          <Route path="/:tenantId" element={<TenantPage />}>
            <Route index element={<Vidvera />} />
            <Route path="invite-user" element={<Invite />} />
            <Route path="invite/:inviteId/accept" element={<AcceptTenantInvitePage />} />
          </Route>
          <Route path="create-tenant" element={<NewTenant />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
