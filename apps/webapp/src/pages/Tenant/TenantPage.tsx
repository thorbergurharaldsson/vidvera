import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { fetchTenantByNameOrId } from '../../api/tenants';
import { AuthContext } from '../../AuthContext';
import { User } from './User';

export const TenantPage = () => {
  const { tenantId } = useParams();
  const tenant = useQuery(['tenant', tenantId], async () => (tenantId ? fetchTenantByNameOrId(tenantId) : null), { enabled: !!tenantId });
  const { profile } = useContext(AuthContext);

  if (!tenantId) {
    return <div>Vinsamlegast veldu fyrirtæki</div>;
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-black sm:text-3xl sm:tracking-tight sm:truncate">{tenant.data?.displayName}</h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <User tenant={tenant.data} />
        </div>
      </div>
      <Outlet context={{ tenant }} />
    </div>
  );
};
