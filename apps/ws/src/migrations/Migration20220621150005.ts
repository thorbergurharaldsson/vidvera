import { Migration } from '@mikro-orm/migrations';

export class Migration20220621150005 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "scopes" ("id" serial primary key, "tenant" uuid not null, "name" varchar(255) not null, "color" varchar(7) not null default \'#000000\', "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );

    this.addSql('create table "scopes_users" ("scopeId" int not null, "userId" varchar(255) not null);');
    this.addSql('alter table "scopes_users" add constraint "scopes_users_pkey" primary key ("scopeId", "userId");');

    this.addSql(
      'alter table "scopes" add constraint "scopes_tenant_foreign" foreign key ("tenant") references "tenants" ("id") on update cascade on delete CASCADE;'
    );

    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_scopeId_foreign" foreign key ("scopeId") references "scopes" ("id") on update cascade on delete cascade;'
    );
    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "scopes_users" drop constraint "scopes_users_scopeId_foreign";');

    this.addSql('drop table if exists "scopes" cascade;');

    this.addSql('drop table if exists "scopes_users" cascade;');
  }
}
