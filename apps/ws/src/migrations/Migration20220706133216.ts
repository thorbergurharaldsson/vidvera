import { Migration } from '@mikro-orm/migrations';

export class Migration20220706133216 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "operators" ("id" uuid not null default uuid_generate_v4(), "name" varchar(255) not null, "displayName" varchar(255) not null, "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "operators" add constraint "operators_name_unique" unique ("name");');
    this.addSql('alter table "operators" add constraint "operators_pkey" primary key ("id");');

    this.addSql(
      'create table "operator_users" ("userId" varchar(255) not null, "operatorId" uuid not null, "role" text check ("role" in (\'operator:admin\', \'operator:user\')) not null default \'operator:user\', "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "operator_users" add constraint "operator_users_pkey" primary key ("userId");');

    this.addSql(
      'create table "operator_tenants" ("tenantId" uuid not null, "operatorId" uuid not null, "status" text check ("status" in (\'pending\', \'active\')) not null default \'pending\', "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "operator_tenants" add constraint "operator_tenants_pkey" primary key ("tenantId");');

    this.addSql(
      'alter table "operator_users" add constraint "operator_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
    );
    this.addSql(
      'alter table "operator_users" add constraint "operator_users_operatorId_foreign" foreign key ("operatorId") references "operators" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "operator_tenants" add constraint "operator_tenants_tenantId_foreign" foreign key ("tenantId") references "tenants" ("id") on update cascade on delete cascade;'
    );
    this.addSql(
      'alter table "operator_tenants" add constraint "operator_tenants_operatorId_foreign" foreign key ("operatorId") references "operators" ("id") on update cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "operator_users" drop constraint "operator_users_operatorId_foreign";');

    this.addSql('alter table "operator_tenants" drop constraint "operator_tenants_operatorId_foreign";');

    this.addSql('drop table if exists "operators" cascade;');

    this.addSql('drop table if exists "operator_users" cascade;');

    this.addSql('drop table if exists "operator_tenants" cascade;');
  }
}
