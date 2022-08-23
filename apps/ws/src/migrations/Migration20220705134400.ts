import { Migration } from '@mikro-orm/migrations';

export class Migration20220705134400 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "tenants_users" ("userId" varchar(255) not null, "tenantId" uuid not null, "role" text check ("role" in (\'tenant:admin\', \'tenant:user\')) not null default \'tenant:user\', "workPhone" varchar(255) null, "isWorkPhonePrivate" boolean not null, "mobilePhone" varchar(255) null, "isMobilePhonePrivate" boolean not null, "jobTitle" varchar(255) null, "email" varchar(255) null, "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "tenants_users" add constraint "tenants_users_tenantId_userId_unique" unique ("tenantId", "userId");');
    this.addSql('alter table "tenants_users" add constraint "tenants_users_pkey" primary key ("userId");');

    this.addSql(
      'create table "tenant_invites" ("id" uuid not null default uuid_generate_v4(), "email" varchar(255) not null, "tenantId" uuid not null, "acceptedAt" timestamptz(0) null, "inviteSentAt" timestamptz(0) null, "expiresAt" timestamptz(0) not null, "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "tenant_invites" add constraint "tenant_invites_pkey" primary key ("id");');

    this.addSql(
      'alter table "tenants_users" add constraint "tenants_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
    );
    this.addSql(
      'alter table "tenants_users" add constraint "tenants_users_tenantId_foreign" foreign key ("tenantId") references "tenants" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "tenant_invites" add constraint "tenant_invites_tenantId_foreign" foreign key ("tenantId") references "tenants" ("id") on update cascade;'
    );

    this.addSql('alter table "users" drop constraint "users_tenant_foreign";');

    this.addSql('alter table "scopes_users" drop constraint "scopes_users_userId_foreign";');

    this.addSql('alter table "users" drop column "tenant";');
    this.addSql('alter table "users" drop column "workPhone";');
    this.addSql('alter table "users" drop column "isWorkPhonePrivate";');
    this.addSql('alter table "users" drop column "mobilePhone";');
    this.addSql('alter table "users" drop column "isMobilePhonePrivate";');
    this.addSql('alter table "users" drop column "jobTitle";');

    this.addSql('alter table "tenants" add column "displayName" varchar(255) not null;');
    this.addSql('alter table "tenants" drop column "accountId";');
    this.addSql('alter table "tenants" drop column "keycloakRealmName";');
    this.addSql('alter table "tenants" drop column "keycloakClientId";');
    this.addSql('alter table "tenants" drop column "keycloakClientSecret";');
    this.addSql('alter table "tenants" add constraint "tenants_name_unique" unique ("name");');

    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_userId_foreign" foreign key ("userId") references "tenants_users" ("userId") on update cascade on delete cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "scopes_users" drop constraint "scopes_users_userId_foreign";');

    this.addSql('drop table if exists "tenants_users" cascade;');

    this.addSql('drop table if exists "tenant_invites" cascade;');

    this.addSql('alter table "scopes_users" drop constraint "scopes_users_userId_foreign";');

    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
    );

    this.addSql(
      'alter table "tenants" add column "accountId" uuid not null default null, add column "keycloakRealmName" varchar not null default null, add column "keycloakClientId" varchar not null default null, add column "keycloakClientSecret" varchar not null default null;'
    );
    this.addSql('alter table "tenants" drop constraint "tenants_name_unique";');
    this.addSql('alter table "tenants" drop column "displayName";');
    this.addSql('alter table "tenants" rename column "displayname" to "keycloakRealmName";');

    this.addSql(
      'alter table "users" add column "tenant" uuid null default null, add column "workPhone" varchar null default null, add column "isWorkPhonePrivate" bool not null default null, add column "mobilePhone" varchar null default null, add column "isMobilePhonePrivate" bool not null default null, add column "jobTitle" varchar null default null;'
    );
    this.addSql(
      'alter table "users" add constraint "users_tenant_foreign" foreign key ("tenant") references "tenants" ("id") on update cascade on delete set null;'
    );
  }
}
