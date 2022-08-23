import { UserAvailability } from '@vidvera/shared';
import { ViewTenantUserDTO } from '@vidvera/core';

export interface StatusCardProps {
  user: ViewTenantUserDTO;
}

export function StatusCard({ user }: StatusCardProps) {
  return (
    <li key={user.name} className="py-10 px-6 bg-indigo-50 text-center rounded-lg xl:px-10 xl:text-left">
      <div className="space-y-3 xl:space-y-5">
        <img
          src={'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'}
          alt={user.name}
          className={`mx-auto mb-4 w-36 h-36 rounded-full ${
            user.presence.availability === UserAvailability.Available
              ? 'border-8 border-green-700'
              : user.presence.availability === UserAvailability.Busy
              ? 'border-8 border-red-700'
              : 'border-8 border-yellow-500'
          }`}
        />
        {/* )} */}
        <div className="font-medium text-lg text-center leading-6 space-y-1">
          <h3 className="text-black">{user.name}</h3>
          <p className="text-indigo-800 text-md">{user.jobTitle}</p>
          <p className="font-light text-sm text-indigo-800">{user.workPhone}</p>
          <p className="font-light text-sm text-indigo-800">{user.email}</p>
          {user.presence.message && <p className="font-light text-sm text-indigo-800">{user.presence.message}</p>}
        </div>
      </div>
    </li>
  );
}
