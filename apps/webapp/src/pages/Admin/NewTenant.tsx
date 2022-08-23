import { PlusSmIcon, XIcon } from '@heroicons/react/outline';
import { useMutation } from '@tanstack/react-query';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import { CreateTenantDTO } from '@vidvera/core';
import { createTenant } from '../../api/tenants';

export default function NewTenant(user: any) {
  const navigate = useNavigate();
  const mutation = useMutation((tenant: CreateTenantDTO) => {
    return createTenant(tenant);
  });

  const schema = Yup.object().shape({
    name: Yup.string()
      .matches(/^([\w\-_]+)$/, 'Path must be lowercase only with no spaces')
      .required('Path is required'),
    displayName: Yup.string().required('Name is required'),
    scopes: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        color: Yup.string()
          .matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Color must be a valid hex color')
          .required('Color is required')
      })
    )
  });

  return (
    <Formik
      initialValues={{ displayName: '', name: '', scopes: [{ name: '', color: '' }] }}
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        navigate(`/${values.name}`);

        toast.success(`Tenant ${values.displayName} created`);
      }}
      validationSchema={schema}
    >
      {({ values, handleChange, handleBlur, errors }) => (
        <Form className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Nýtt fyrirtæki</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Hérna getur þú stofnað nýtt fyrirtæki.</p>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Nafn fyrirtækis
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <Field
                    name="displayName"
                    type="text"
                    className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                      errors.displayName && 'field-invalid'
                    }`}
                  />
                  <ErrorMessage name="displayName" component="span" className="field-invalid-message" />
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Slóð fyrirtækis
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      vidvera.snerpa.is/
                    </span>
                    <Field
                      type="text"
                      name="name"
                      className={`flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 ${
                        errors.name && 'field-invalid'
                      }`}
                    />
                  </div>
                  <ErrorMessage name="name" component="span" className="field-invalid-message" />
                </div>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="scopes" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Verksvið
                </label>
                <FieldArray
                  name="scopes"
                  render={({ remove, push }) => (
                    <div className="sm:col-span-2 flex flex-col gap-4">
                      {values.scopes.map((scope, index) => (
                        <div key={index} className="mt-1 sm:mt-0  flex flex-row gap-2 items-start w-full">
                          <div className="flex-col gap-4 max-w-lg w-full">
                            <div className="mb-2">
                              <Field
                                name={`scopes[${index}].name`}
                                type="text"
                                placeholder="Nafn verksviðs"
                                className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                                  (errors.scopes?.[index] as any)?.name && 'field-invalid'
                                }`}
                              />
                              <ErrorMessage name={`scopes[${index}].name`} component="span" className="field-invalid-message" />
                            </div>
                            <div>
                              <Field
                                name={`scopes[${index}].color`}
                                type="text"
                                placeholder="#000000"
                                className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                                  (errors.scopes?.[index] as any)?.color && 'field-invalid'
                                }`}
                              />
                              <ErrorMessage name={`scopes[${index}].color`} component="span" className="field-invalid-message" />
                            </div>
                          </div>
                          <button type="button" onClick={() => remove(index)} className="inline-flex items-center px-4 text-indigo-600">
                            <XIcon className="h-10 w-10" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => push('')}
                      >
                        <PlusSmIcon aria-hidden="true" />
                      </button>
                    </div>
                  )}
                ></FieldArray>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hætta við
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span>Stofna fyrirtæki</span>
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
