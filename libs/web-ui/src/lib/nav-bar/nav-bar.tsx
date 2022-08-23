import { AuthContextState } from '@vidvera/core';
import { UsersIcon, ChevronDownIcon, ChevronRightIcon, MailIcon, OfficeBuildingIcon, KeyIcon } from '@heroicons/react/outline';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { matchPath } from 'react-router';
import { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function NavBar({ user }: { user: AuthContextState }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { tenantId } = useParams();
  const { keycloak } = useKeycloak();

  const handleToggle = (e: any) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex-1 flex flex-col min-h-max max-h-screen sticky top-0 bg-indigo-700 w-1/6">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-white text-lg sm:text-4xl font-medium uppercase">Viðvera</span>
          {/* <img className="h-24 w-auto" src="https://clipart.coolclips.com/480/vectors/tf05281/CoolClips_vc050478.png" alt="Vidvera Logo" /> */}
        </div>
        <div className="relative mx-4 my-4">
          <select
            id="tenant"
            name="tenant"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-indigo-500 text-white"
            value={tenantId}
            onChange={(e) => {
              navigate('/' + e.target.value);
            }}
          >
            <option key={null} value="">
              -- Velja fyrirtæki --
            </option>
            {user.profile?.tenants.map((tenant) => (
              <option key={tenant.tenantId} value={tenant.name}>
                {tenant.displayName}
              </option>
            ))}
          </select>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1" aria-label="Sidebar">
          <a
            href={`/${tenantId ?? ''}`}
            className="text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-75 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
          >
            <UsersIcon className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300" aria-hidden="true" />
            <span className="flex-1">Viðvera</span>
          </a>
          <Link to={`/create-tenant`}>
            <li className="flex items-center px-2 py-2 text-sm font-medium rounded-md">
              <OfficeBuildingIcon className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300" aria-hidden="true" />
              <span className="flex-1 text-indigo-100">Stofna fyrirtæki</span>
            </li>
          </Link>
          <a
            onClick={(e) => handleToggle(e)}
            className={classNames(
              'text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-75',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer'
            )}
          >
            <KeyIcon className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300" aria-hidden="true" />
            <span className="flex-1">Sjórnborð</span>
            {isOpen ? (
              <ChevronDownIcon className="ml-1 h-6 w-6 text-indigo-300" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="ml-1 h-6 w-6 text-indigo-300" aria-hidden="true" />
            )}
          </a>
          {isOpen && (
            <ul className="mt-5 flex-1 px-2 space-y-1">
              <Link to={`/${tenantId}/invite-user`}>
                <li className="flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <MailIcon className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300" aria-hidden="true" />
                  <span className="flex-1 text-indigo-300">Bjóða notanda</span>
                </li>
              </Link>
            </ul>
          )}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
        <a href="#" className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <img
                className="inline-block h-9 w-9 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.user?.name}</p>
              <button className="text-xs font-medium text-indigo-200 group-hover:text-white" onClick={() => keycloak.logout()}>
                Skrá út
              </button>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
