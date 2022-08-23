import { Migration } from '@mikro-orm/migrations';

export class Migration20220810142241 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "tenants_users" drop constraint "tenants_users_userId_foreign";');

    this.addSql('alter table "scopes_users" drop constraint "scopes_users_userId_foreign";');

    this.addSql('alter table "tenants_users" add column "id" uuid not null default uuid_generate_v4();');
    this.addSql('alter table "tenants_users" drop constraint "tenants_users_pkey";');
    this.addSql(
      'alter table "tenants_users" add constraint "tenants_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade;'
    );
    this.addSql('alter table "tenants_users" add constraint "tenants_users_pkey" primary key ("id");');

    this.addSql('alter table "scopes_users" alter column "userId" drop default;');
    this.addSql('alter table "scopes_users" alter column "userId" type uuid using ("userId"::text::uuid);');
    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_userId_foreign" foreign key ("userId") references "tenants_users" ("id") on update cascade on delete cascade;'
    );

    this.addSql(
      "create table \"tenant_user_presence\" (\"userId\" uuid not null, \"availability\" text check (\"availability\" in ('available', 'available-idle', 'away', 'be-right-back', 'busy', 'busy-idle', 'do-not-disturb', 'offline', 'presence-unknown')) not null, \"message\" varchar(255) null, \"expiresAt\" timestamptz(0) not null, \"updatedAt\" timestamptz(0) not null default now(), \"createdAt\" timestamptz(0) not null default now());"
    );
    this.addSql('alter table "tenant_user_presence" add constraint "tenant_user_presence_pkey" primary key ("userId");');

    this.addSql(
      "create table \"presence_sessions\" (\"id\" uuid not null default uuid_generate_v4(), \"user\" uuid not null, \"availability\" text check (\"availability\" in ('available', 'available-idle', 'away', 'be-right-back', 'busy', 'busy-idle', 'do-not-disturb', 'offline', 'presence-unknown')) not null, \"activity\" text check (\"activity\" in ('available', 'away', 'be-right-back', 'busy', 'do-not-disturb', 'in-a-call', 'in-a-conference-call', 'inactive', 'in-a-meeting', 'offline', 'off-work', 'out-of-office', 'presence-unknown', 'presenting', 'urgent-interruptions-only')) null, \"message\" varchar(255) null, \"expiresAt\" timestamptz(0) not null, \"updatedAt\" timestamptz(0) not null default now(), \"createdAt\" timestamptz(0) not null default now());"
    );
    this.addSql('alter table "presence_sessions" add constraint "presence_sessions_pkey" primary key ("id");');

    this.addSql(
      'alter table "tenant_user_presence" add constraint "tenant_user_presence_userId_foreign" foreign key ("userId") references "tenants_users" ("id") on update cascade on delete cascade;'
    );

    this.addSql(
      'alter table "presence_sessions" add constraint "presence_sessions_user_foreign" foreign key ("user") references "tenants_users" ("id") on update cascade;'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "tenant_user_presence" cascade;');

    this.addSql('drop table if exists "presence_sessions" cascade;');

    this.addSql('alter table "scopes_users" drop constraint "scopes_users_userId_foreign";');
    this.addSql('alter table "tenants_users" drop constraint "tenants_users_userId_foreign";');

    this.addSql('alter table "tenants_users" drop constraint "tenants_users_pkey";');
    this.addSql('alter table "tenants_users" drop column "id";');
    this.addSql(
      'alter table "tenants_users" add constraint "tenants_users_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
    );
    this.addSql('alter table "tenants_users" add constraint "tenants_users_pkey" primary key ("userId");');

    this.addSql('alter table "scopes_users" alter column "userId" type varchar using ("userId"::varchar);');

    this.addSql('alter table "scopes_users" alter column "userId" type text using ("userId"::text);');

    this.addSql(
      'alter table "scopes_users" add constraint "scopes_users_userId_foreign" foreign key ("userId") references "tenants_users" ("userId") on update cascade on delete cascade;'
    );
  }
}
