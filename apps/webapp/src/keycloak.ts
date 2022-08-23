import Keycloak from 'keycloak-js';

export const keycloakOptions = {
  url: 'https://audkenni.snerpa.is',
  realm: 'vidvera',
  clientId: 'vidvera-web'
};

const keycloak = new Keycloak(keycloakOptions);

export { keycloak };
export default keycloak;
