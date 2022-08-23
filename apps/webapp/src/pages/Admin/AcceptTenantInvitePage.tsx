import { useMutation, useQuery } from '@tanstack/react-query';
import { AcceptTenantInviteDTO } from '@vidvera/core';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { acceptTenantUserInvite, fetchTenantUserInvite } from '../../api/tenants';

export const AcceptTenantInvitePage = () => {
  const { tenantId, inviteId } = useParams();
  const navigate = useNavigate();

  const inviteQuery = useQuery(['tenantInvite', tenantId, inviteId], () => fetchTenantUserInvite(tenantId!, inviteId!), {
    enabled: !!tenantId && !!inviteId
  });

  const mutation = useMutation((values: AcceptTenantInviteDTO) => {
    return acceptTenantUserInvite(tenantId!, inviteId!, values);
  });

  const schema = Yup.object().shape({
    workPhone: Yup.string(),
    isWorkPhonePrivate: Yup.boolean(),
    mobilePhone: Yup.string(),
    isMobilePhonePrivate: Yup.boolean(),
    jobTitle: Yup.string(),
    email: Yup.string().email('Invalid email address')
  });

  return (
    <Formik
      validateOnBlur
      initialValues={{ workPhone: '', isWorkPhonePrivate: true, mobilePhone: '', isMobilePhonePrivate: true, jobTitle: '', email: '' }}
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        toast.success(`Skráningu lokið`);
        navigate(`/${tenantId}`);
      }}
      validationSchema={schema}
    >
      {({ values, handleChange, handleBlur, errors }) => (
        <Form className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Klára notandaskráningu</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Til að ganga frá skráningu í fyrirtæki þarf að fylla út eftirfarandi form
                </p>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="workPhone" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Vinnusími
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <Field
                    name="workPhone"
                    type="text"
                    className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                      errors.workPhone && 'field-invalid'
                    }`}
                  />
                  <ErrorMessage name="workPhone" component="span" className="field-invalid-message" />
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Farsími
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <Field
                    name="mobilePhone"
                    type="text"
                    className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                      errors.mobilePhone && 'field-invalid'
                    }`}
                  />
                  <ErrorMessage name="mobilePhone" component="span" className="field-invalid-message" />
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Starfsheiti
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <Field
                    name="jobTitle"
                    type="text"
                    className={`block max-w-lg w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                      errors.jobTitle && 'field-invalid'
                    }`}
                  />
                  <ErrorMessage name="jobTitle" component="span" className="field-invalid-message" />
                </div>
              </div>
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
                <span>Ljúka skráningu</span>
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
