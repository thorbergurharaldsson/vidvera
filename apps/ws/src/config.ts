import { registerAs } from '@nestjs/config';
import joi from 'joi';

export const databaseConfig = registerAs('database', () => ({
  type: process.env.MIKRO_ORM_TYPE,
  host: process.env.MIKRO_ORM_HOST,
  name: process.env.MIKRO_ORM_DB_NAME,
  user: process.env.MIKRO_ORM_USER,
  password: process.env.MIKRO_ORM_PASSWORD,
  migrations: process.env.MIKRO_ORM_MIGRATIONS_PATH?.split(',') ?? [],
  automaticMigrations: process.env.AUTOMATIC_MIGRATIONS === 'true'
}));

export const appConfig = registerAs('app', () => ({
  frontendUrl: process.env.FRONTEND_URL
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : undefined,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  security: process.env.MAIL_SECURITY === 'true',
  from: process.env.MAIL_FROM,
  replyTo: process.env.MAIL_REPLY_TO,
  replyToName: process.env.MAIL_REPLY_TO_NAME
}));

export const appConfigSchema = joi.object().keys({
  MIKRO_ORM_TYPE: joi.string().required(),
  MIKRO_ORM_HOST: joi.string().required(),
  MIKRO_ORM_DB_NAME: joi.string().required(),
  MIKRO_ORM_USER: joi.string().required(),
  MIKRO_ORM_PASSWORD: joi.string().required(),
  MIKRO_ORM_ENTITIES: joi.string().forbidden(), // Not allowed when autoLoadEntities is true
  MIKRO_ORM_ENTITIES_TS: joi.string().forbidden(), // Not allowed when autoLoadEntities is true
  AUTOMATIC_MIGRATIONS: joi.boolean(),
  KEYCLOAK_CLIENT_ID: joi.string().required(),
  KEYCLOAK_ISSUER: joi.string().required(),
  KEYCLOAK_CLIENT_SECRET: joi.string().required(),
  MAIL_HOST: joi.string().required().hostname(),
  MAIL_PORT: joi.number().optional().default(25),
  MAIL_USER: joi.string().optional(),
  MAIL_PASSWORD: joi.string().optional(),
  MAIL_SECURITY: joi.boolean().optional().default(false),
  MAIL_FROM: joi.string().required().email(),
  MAIL_REPLY_TO: joi.string().optional(),
  MAIL_REPLY_TO_NAME: joi.string().optional(),
  FRONTEND_URL: joi.string().required().uri()
});

export const keycloakConfig = registerAs('keycloak', () => ({
  client_id: process.env.KEYCLOAK_CLIENT_ID,
  issuer: process.env.KEYCLOAK_ISSUER,
  client_secret: process.env.KEYCLOAK_CLIENT_SECRET
}));
