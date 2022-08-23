import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, HealthCheckResult } from '@nestjs/terminus';

import { MikroOrmHealthIndicator } from './mikro-orm.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private mikroOrm: MikroOrmHealthIndicator) {}

  @ApiOperation({
    summary: 'Get Service Health',
    description: "Returns the Service health or an error if it's not healthy"
  })
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mikroOrm.check('database')]);
  }
}
