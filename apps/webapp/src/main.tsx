import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from './AuthContext';
import App from './app/app';
import keycloak from './keycloak';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{ silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html', onLoad: 'check-sso' }}
  >
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StrictMode>
  </ReactKeycloakProvider>
);
