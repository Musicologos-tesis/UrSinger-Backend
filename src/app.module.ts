import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CalibrationsModule } from './calibrations/calibrations.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule, CalibrationsModule, MetricsModule],
})
export class AppModule {}
