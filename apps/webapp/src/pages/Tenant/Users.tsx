/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ViewScopeDTO, ViewTenantDTO } from '@vidvera/core';
import { SearchBar, StatusCard, Filter, FilterOption } from '@vidvera/web-ui';
import React, { useState } from 'react';
import { createSearchParams, Outlet, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { fetchTenantByNameOrId, fetchTenantUsers } from '../../api/tenants';

type VidveraParams = {
  tenantId: string;
};

export default function Vidvera() {
  const { tenant } = useOutletContext<{ tenant: UseQueryResult<ViewTenantDTO> }>();
  const [query] = useSearchParams();
  const navigate = useNavigate();

  const fetchedPeople = useQuery(
    ['users', tenant.data?.id, query.get('q'), query.getAll('scope')],
    async () =>
      tenant.isSuccess ? fetchTenantUsers(tenant.data.id, query.get('q') ?? undefined, { scopes: query.getAll('scope') }) : null,
    {
      enabled: tenant.isSuccess
    }
  );

  const searchFunction = (searchTerm: string) => {
    navigate({
      search: `?${createSearchParams({ ...Object.fromEntries(query), q: searchTerm })}`
    });
  };

  return (
    <>
      <div className="py-5 border-b border-gray-200 flex-row flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Starfsmenn</h3>
        <div className="flex flex-row gap-4 items-center">
          <Filter
            filterFunction={(filters) => {
              navigate({
                search: `?${createSearchParams({ ...Object.fromEntries(query), ...filters })}`
              });
            }}
            initialFilters={{
              scope: query.getAll('scope')
            }}
            filters={
              tenant.isSuccess
                ? [
                    {
                      id: 'scope',
                      name: 'Verksvið',
                      options: (tenant.data.scopes ?? []).map((scope) => ({ value: scope.id.toString(), label: scope.name }))
                    }
                  ]
                : []
            }
          />
          <SearchBar searchFunction={searchFunction} />
        </div>
      </div>

      <ul className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 2xl:grid-cols-5 py-4">
        {fetchedPeople.isSuccess ? fetchedPeople.data?.items.map((user) => <StatusCard user={user} key={user.id} />) : <div>Loading</div>}
      </ul>
    </>
  );
}
