import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmHealthIndicator extends HealthIndicator {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    const { result } = await this.em.execute<{ result: number }>('SELECT 1+1 as result', [], 'get');

    const isHealthy = result === 2;

    if (!isHealthy) {
      throw new HealthCheckError('Database error', this.getStatus(key, isHealthy));
    }

    return this.getStatus(key, isHealthy);
  }
}
