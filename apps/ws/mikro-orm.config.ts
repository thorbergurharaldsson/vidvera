import { EntityCaseNamingStrategy } from '@mikro-orm/core';

import * as migrations from './src/migrations';

export default {
  namingStrategy: EntityCaseNamingStrategy,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: './src/migrations',
    glob: '!(*.d).{js,ts}',
    disableForeignKeys: false,
    migrationsList: Object.values(migrations).map((migration) => ({
      name: migration.name,
      class: migration
    }))
  }
};
