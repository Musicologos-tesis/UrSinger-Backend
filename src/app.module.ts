import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CalibrationsModule } from './calibrations/calibrations.module';
import { MetricsModule } from './metrics/metrics.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    CalibrationsModule,
    MetricsModule,
    LearningModule,
  ],
})
export class AppModule {}
