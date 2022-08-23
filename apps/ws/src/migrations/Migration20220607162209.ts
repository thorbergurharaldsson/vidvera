import { Migration } from '@mikro-orm/migrations';

export class Migration20220607162209 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "users" add column "email" varchar(255) null;');
    this.addSql('alter table "users" alter column "name" type varchar(255) using ("name"::varchar(255));');
    this.addSql('alter table "users" alter column "name" drop not null;');
    this.addSql('alter table "users" alter column "workPhone" type varchar(255) using ("workPhone"::varchar(255));');
    this.addSql('alter table "users" alter column "workPhone" drop not null;');
    this.addSql('alter table "users" alter column "mobilePhone" type varchar(255) using ("mobilePhone"::varchar(255));');
    this.addSql('alter table "users" alter column "mobilePhone" drop not null;');
    this.addSql('alter table "users" alter column "jobTitle" type varchar(255) using ("jobTitle"::varchar(255));');
    this.addSql('alter table "users" alter column "jobTitle" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" alter column "name" type varchar using ("name"::varchar);');
    this.addSql('alter table "users" alter column "name" set not null;');
    this.addSql('alter table "users" alter column "workPhone" type varchar using ("workPhone"::varchar);');
    this.addSql('alter table "users" alter column "workPhone" set not null;');
    this.addSql('alter table "users" alter column "mobilePhone" type varchar using ("mobilePhone"::varchar);');
    this.addSql('alter table "users" alter column "mobilePhone" set not null;');
    this.addSql('alter table "users" alter column "jobTitle" type varchar using ("jobTitle"::varchar);');
    this.addSql('alter table "users" alter column "jobTitle" set not null;');
    this.addSql('alter table "users" drop column "email";');
  }
}
