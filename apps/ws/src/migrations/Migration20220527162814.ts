import { Migration } from '@mikro-orm/migrations';

export class Migration20220527162814 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "tenants" add column "createdAt" timestamptz(0) not null default now(), add column "updatedAt" timestamptz(0) not null default now();'
    );
    this.addSql('alter table "tenants" alter column "id" drop default;');
    this.addSql('alter table "tenants" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "tenants" alter column "id" set default uuid_generate_v4();');
  }

  async down(): Promise<void> {
    this.addSql('alter table "tenants" alter column "id" drop default;');
    this.addSql('alter table "tenants" alter column "id" drop default;');
    this.addSql('alter table "tenants" alter column "id" type uuid using ("id"::text::uuid);');
    this.addSql('alter table "tenants" drop column "createdAt";');
    this.addSql('alter table "tenants" drop column "updatedAt";');
  }
}
