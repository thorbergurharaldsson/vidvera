import { Migration } from '@mikro-orm/migrations';

export class Migration20220602144949 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "users" ("id" varchar(255) not null, "name" varchar(255) not null, "tenant" uuid null, "workPhone" varchar(255) not null, "isWorkPhonePrivate" boolean not null, "mobilePhone" varchar(255) not null, "isMobilePhonePrivate" boolean not null, "jobTitle" varchar(255) not null, "createdAt" timestamptz(0) not null default now(), "updatedAt" timestamptz(0) not null default now());'
    );
    this.addSql('alter table "users" add constraint "users_pkey" primary key ("id");');

    this.addSql(
      'alter table "users" add constraint "users_tenant_foreign" foreign key ("tenant") references "tenants" ("id") on update cascade on delete set null;'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "users" cascade;');
  }
}
