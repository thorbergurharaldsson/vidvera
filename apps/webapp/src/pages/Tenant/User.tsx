import { Menu, Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckCircleIcon, MinusCircleIcon, ClockIcon } from '@heroicons/react/solid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserAvailability } from '@vidvera/shared';
import { ErrorMessage, Form, Formik } from 'formik';
import { Fragment, useContext } from 'react';
import * as Yup from 'yup';
import { fetchTenantUser, setTenantUserPresence } from '../../api/tenants';
import { AuthContext } from '../../AuthContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const User = ({ tenant }: { tenant: any }) => {
  const { user, authenticated } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const userQuery = useQuery(
    ['user', tenant?.id, user?.sub],
    async () => {
      if (!user || !tenant) {
        return null;
      }

      return fetchTenantUser(tenant.id, user.sub);
    },
    {
      enabled: !!user?.sub && authenticated
    }
  );

  const mutation = useMutation(
    async ({ availability, message }: { availability: UserAvailability; message?: string }) => {
      if (!user?.sub || !tenant.id) {
        return null;
      }

      return setTenantUserPresence(tenant.id, user.sub, {
        availability,
        message,
        expiresAfterSec: 3600
      });
    },
    { onSuccess: () => queryClient.invalidateQueries(['user']) }
  );

  if (!userQuery.data) {
    return null;
  }

  return (
    <div className="bg-indigo-50 rounded-lg flex flex-row items-center px-4 py-2 w-72 gap-8 z-20">
      <img
        src={'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'}
        alt={userQuery.data.name}
        className={`w-12 h-12 rounded-full ${
          userQuery.data.presence.availability === UserAvailability.Available
            ? 'border-4 border-green-700'
            : userQuery.data.presence.availability === UserAvailability.Busy
            ? 'border-4 border-red-700'
            : userQuery.data.presence.availability === UserAvailability.Away
            ? 'border-4 border-yellow-500'
            : ''
        }`}
      />
      <div className="font-medium leading-6">
        <h3 className="text-black m-0">{userQuery.data.name}</h3>
        <p className="font-light text-sm text-indigo-800">{userQuery.data.email}</p>
        <div className="flex flex-row gap-4">
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span>Staða</span>
                <ChevronDownIcon className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => mutation.mutate({ availability: UserAvailability.Available })}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'px-4 py-2 text-sm text-gray-700 w-full text-left flex flex-row place-items-center gap-1'
                      )}
                    >
                      <CheckCircleIcon className="text-green-500 w-4 h-4" />
                      <span>Laus</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => mutation.mutate({ availability: UserAvailability.Busy })}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'px-4 py-2 text-sm text-gray-700 w-full text-left flex flex-row place-items-center gap-1'
                      )}
                    >
                      <MinusCircleIcon className="text-red-500 w-4 h-4" />
                      <span>Upptekinn</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => mutation.mutate({ availability: UserAvailability.Away })}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'px-4 py-2 text-sm text-gray-700 w-full text-left flex flex-row place-items-center gap-1'
                      )}
                    >
                      <ClockIcon className="text-yellow-500 w-4 h-4" />
                      <span>Ekki við</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          <Popover as="div" className="relative z-10 inline-block text-left">
            <div>
              <Popover.Button className="inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span>Skilaboð</span>
                <ChevronDownIcon className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              </Popover.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel className="origin-top-right absolute right-0 mt-2 bg-white rounded-md shadow-2xl p-4 ring-1 ring-black ring-opacity-5 focus:outline-none w-96">
                <Formik
                  initialValues={{ message: userQuery.data.presence.message }}
                  onSubmit={async (values) => {
                    if (!userQuery.isSuccess) {
                      return;
                    }

                    await mutation.mutateAsync({ availability: userQuery.data!.presence.availability, message: values.message });
                  }}
                  validationSchema={Yup.object().shape({
                    message: Yup.string().max(254, 'Hámarkslengd skilaboða er 254 stafir').required('Skilaboð er nauðsynlegt')
                  })}
                >
                  {({ values, handleBlur, handleChange, errors }) => (
                    <Form className="flex flex-col gap-2">
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                          Skilaboð
                        </label>
                        <div className="mt-1">
                          <textarea
                            rows={6}
                            value={values.message}
                            name="message"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              errors.message && 'field-invalid'
                            }`}
                          />
                          <ErrorMessage name="message" className="field-invalid-message"></ErrorMessage>
                        </div>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <span>Vista</span>
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Popover.Panel>
            </Transition>
          </Popover>
        </div>
      </div>
    </div>
  );
};
