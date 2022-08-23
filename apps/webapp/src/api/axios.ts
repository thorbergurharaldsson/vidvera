import axios from 'axios';
import keycloak from '../keycloak';

const client = axios.create({
  baseURL: 'http://localhost:8080'
});

client.interceptors.request.use(async (config) => {
  if (!keycloak.authenticated) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${keycloak.token}`
    }
  };
});

export default client;
