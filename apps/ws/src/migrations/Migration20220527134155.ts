import { Migration } from '@mikro-orm/migrations';

export class Migration20220527134155 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "tenants" ("id" uuid not null, "name" varchar(255) not null, "accountId" uuid not null, "keycloakRealmName" varchar(255) not null, "keycloakClientId" varchar(255) not null, "keycloakClientSecret" varchar(255) not null);'
    );
    this.addSql('alter table "tenants" add constraint "tenants_pkey" primary key ("id");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "tenants" cascade;');
  }
}
