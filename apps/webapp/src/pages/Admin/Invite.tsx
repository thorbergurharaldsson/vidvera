import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import { createTenantUserInvite } from '../../api/tenants';
import { AuthContext } from '../../AuthContext';

export default function Invite() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();

  const mutation = useMutation(({ tenantId, email }: { tenantId: string; email: string }) => {
    return createTenantUserInvite(tenantId, { email: email });
  });

  const schema = Yup.object().shape({
    tenantId: Yup.string().required('Tenant ID is required'),
    email: Yup.string().email('Invalid email address').required('Email is required')
  });

  return (
    <Formik
      validateOnBlur
      initialValues={{ tenantId: '', email: '' }}
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        toast.success(`Invite sent to ${values.email}`);
        navigate(`/${values.tenantId}`);
      }}
      validationSchema={schema}
    >
      {({ values, handleChange, handleBlur, errors }) => (
        <Form className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Bjóða notanda</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Hérna getur þú boðið notanda að vera með þér í þessari þjónustu.</p>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="tenant" className="block text-sm font-medium leading-5 text-gray-700">
                  Fyrirtæki
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <select
                    name="tenantId"
                    className="block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    value={values.tenantId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Veldu fyrirtæki</option>
                    {user.profile &&
                      user.profile.tenants.map((tenant) => (
                        <option key={tenant.tenantId} value={tenant.tenantId}>
                          {tenant.displayName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              {/* )} */}
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Netfang
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <Field
                    name="email"
                    type="email"
                    className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                      errors.email && 'field-invalid'
                    }`}
                  />
                  <ErrorMessage name="email" component="span" className="field-invalid-message" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hætta við
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span>Senda boð</span>
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
